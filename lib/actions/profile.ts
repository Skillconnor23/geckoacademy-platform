'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getUser, updateAvatarUrl } from '@/lib/db/queries';
import { updateUserName } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { getR2, getR2Bucket, getR2PublicBaseUrl } from '@/lib/r2';
import { validateAvatarFile } from '@/lib/upload/avatar';

export type UploadAvatarResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadAvatarAction(
  _prev: unknown,
  formData: FormData
): Promise<UploadAvatarResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  const file = formData.get('file') as File | null;
  if (!file || !file.size) {
    return { success: false, error: 'No file provided.' };
  }

  const validation = validateAvatarFile(file);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    const bucket = getR2Bucket();
    const baseUrl = getR2PublicBaseUrl();
    const client = getR2();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `avatars/${user.id}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = `${baseUrl}/${key}`;
    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('Avatar upload error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed.',
    };
  }
}

export type UpdateAvatarUrlResult =
  | { success: true }
  | { success: false; error: string };

export async function updateAvatarUrlAction(url: string): Promise<UpdateAvatarUrlResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not signed in.' };

  try {
    await updateAvatarUrl(user.id, url);
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save avatar.',
    };
  }
}

export async function updateMyProfileAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const name = (formData.get('name') as string | null)?.trim() ?? null;

  await updateUserName(user.id, name);
  revalidatePath('/dashboard/profile');
  return {};
}
