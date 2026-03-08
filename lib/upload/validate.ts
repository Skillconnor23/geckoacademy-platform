/**
 * Server-side upload validation: extension, MIME, and magic-byte checks.
 * Reduces risk of spoofed or malicious uploads.
 *
 * Malware scanning is NOT implemented. Use a separate service (e.g. ClamAV, cloud scan)
 * for production-grade protection against malware.
 */

// Magic-byte signatures (hex)
const MAGIC = {
  pdf: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  zip: Buffer.from([0x50, 0x4b, 0x03, 0x04]), // DOCX, PPTX, XLSX
  mp3_id3: Buffer.from([0x49, 0x44, 0x33]), // ID3 tag
  mp4_ftyp: Buffer.from([0x66, 0x74, 0x79, 0x70]), // ftyp at offset 4
} as const;

function hasMagic(buffer: Buffer, sig: Buffer): boolean {
  return buffer.length >= sig.length && buffer.subarray(0, sig.length).equals(sig);
}

function hasMagicAt(buffer: Buffer, sig: Buffer, offset: number): boolean {
  return buffer.length >= offset + sig.length && buffer.subarray(offset, offset + sig.length).equals(sig);
}

/** MP3: ID3v2 or MPEG frame sync (FF Fx where x is E-F or 2-B). */
function isMp3Like(buffer: Buffer): boolean {
  if (buffer.length < 3) return false;
  if (hasMagic(buffer, MAGIC.mp3_id3)) return true;
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true; // MPEG frame
  return false;
}

/** M4A/MP4: ftyp at offset 4. */
function isM4aLike(buffer: Buffer): boolean {
  return buffer.length >= 8 && hasMagicAt(buffer, MAGIC.mp4_ftyp, 4);
}

export type ValidationResult =
  | { ok: true; sanitizedExtension: string }
  | { ok: false; error: string };

type AllowedEntry = {
  mime: string;
  extensions: readonly string[];
};

export function validateUpload(
  buffer: Buffer,
  clientMime: string,
  clientFilename: string,
  allowed: readonly AllowedEntry[],
  maxBytes: number
): ValidationResult {
  if (buffer.length === 0) {
    return { ok: false, error: 'File is empty.' };
  }
  if (buffer.length > maxBytes) {
    return { ok: false, error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).` };
  }

  const entry = allowed.find((e) => e.mime === clientMime);
  if (!entry) {
    return { ok: false, error: 'Invalid file type. Check allowed formats.' };
  }

  const ext = getExtension(clientFilename);
  if (!ext) {
    return { ok: false, error: 'Filename must have an extension.' };
  }
  const lowerExt = ext.toLowerCase();
  if (!entry.extensions.some((e) => e.toLowerCase() === lowerExt)) {
    return { ok: false, error: `Extension .${ext} does not match type ${clientMime}.` };
  }

  // Magic-byte checks for high-confidence detection
  const mime = clientMime.toLowerCase();
  if (mime === 'application/pdf') {
    if (!hasMagic(buffer, MAGIC.pdf)) return { ok: false, error: 'File content does not match PDF format.' };
  } else if (mime === 'image/png') {
    if (!hasMagic(buffer, MAGIC.png)) return { ok: false, error: 'File content does not match PNG format.' };
  } else if (mime === 'image/jpeg' || mime === 'image/jpg') {
    if (!hasMagic(buffer, MAGIC.jpeg)) return { ok: false, error: 'File content does not match JPEG format.' };
  } else if (
    mime.includes('wordprocessingml') ||
    mime.includes('presentationml') ||
    mime.includes('spreadsheetml')
  ) {
    if (!hasMagic(buffer, MAGIC.zip)) return { ok: false, error: 'File content does not match Office document format.' };
  } else if (mime === 'audio/mpeg' || mime === 'audio/mp3') {
    if (!isMp3Like(buffer)) return { ok: false, error: 'File content does not match MP3 format.' };
  } else if (mime === 'audio/m4a' || mime === 'audio/x-m4a') {
    if (!isM4aLike(buffer)) return { ok: false, error: 'File content does not match M4A format.' };
  }

  return { ok: true, sanitizedExtension: lowerExt };
}

function getExtension(filename: string): string | null {
  const name = (filename || '').trim();
  const lastDot = name.lastIndexOf('.');
  if (lastDot < 0 || lastDot === name.length - 1) return null;
  return name.slice(lastDot);
}

/** Sanitize filename for storage key: alphanumeric, dots, hyphens only. */
export function sanitizeStorageFilename(filename: string): string {
  const ext = getExtension(filename) ?? '';
  const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  return base ? `${base}${ext}` : `file${ext}`;
}
