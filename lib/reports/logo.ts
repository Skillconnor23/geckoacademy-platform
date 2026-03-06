import { readFile } from 'fs/promises';
import path from 'path';

/** Resolve Gecko logo as a data URL for embedding in report HTML/PDF. Returns null if file missing. */
export async function getGeckoLogoDataUrl(): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'gecko-logo.svg');
    const buffer = await readFile(filePath);
    const base64 = buffer.toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    return null;
  }
}
