'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/user';
import { platformRoleSchema } from '@/lib/validations/platform-role';
import { redirect } from 'next/navigation';

export async function setPlatformRole(prevState: { error?: string }, formData: FormData) {
  const user = await requireAuth();

  const result = platformRoleSchema.safeParse(formData.get('platformRole'));
  if (!result.success) {
    return { error: 'Please select a valid role.' };
  }

  const role = result.data;

  await db
    .update(users)
    .set({ platformRole: role, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  redirect('/dashboard');
}
