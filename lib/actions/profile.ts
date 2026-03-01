'use server';

import { getUser } from '@/lib/db/queries';
import { updateUserName } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

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
