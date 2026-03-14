'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getUser } from '@/lib/db/queries';
import { getR2, getR2Bucket, getR2PublicBaseUrl } from '@/lib/r2';

/** Allowed MIME types for teacher-recorded audio (MediaRecorder outputs webm/ogg). */
const ALLOWED_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
] as const;

const ALLOWED_EXTENSIONS = ['.webm', '.ogg'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export type UploadAudioResult =
  | { success: true; url: string }
  | { success: false; error: string };

function isValidRecordedAudio(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (ext && !ALLOWED_EXTENSIONS.includes(ext) && !file.name.toLowerCase().endsWith('.webm') && !file.name.toLowerCase().endsWith('.ogg')) {
    return false;
  }
  const type = file.type?.toLowerCase();
  if (!type) return true;
  return type.startsWith('audio/webm') || type.startsWith('audio/ogg');
}

export async function uploadAudioFileAction(
  _prev: unknown,
  formData: FormData
): Promise<UploadAudioResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  const file = formData.get('file') as File | null;
  if (!file || !file.size) {
    return { success: false, error: 'No file provided.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Recording too large (max 10 MB).' };
  }
  if (!isValidRecordedAudio(file)) {
    return {
      success: false,
      error: 'Invalid audio type. Use in-browser recording.',
    };
  }

  try {
    const bucket = getR2Bucket();
    const baseUrl = getR2PublicBaseUrl();
    const client = getR2();
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.') || 0) || '.webm';
    const key = `audio/${Date.now()}-${String(Math.random()).slice(2, 10)}${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'audio/webm',
      })
    );

    const publicUrl = `${baseUrl}/${key}`;
    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('Audio upload error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed.',
    };
  }
}
