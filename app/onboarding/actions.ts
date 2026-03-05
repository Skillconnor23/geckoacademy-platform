'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/user';
import { platformRoleSchema } from '@/lib/validations/platform-role';
import { redirect } from 'next/navigation';
import { assertValidOrigin } from '@/lib/security/csrf';

export async function setPlatformRole(prevState: { error?: string }, formData: FormData) {
  await assertValidOrigin();
  const user = await requireAuth();

  const result = platformRoleSchema.safeParse(formData.get('platformRole'));
  if (!result.success) {
    return { error: 'Please select a valid role.' };
  }

  const role = result.data;

  // Self-serve onboarding can only ever set the least-privileged role.
  // Elevated roles must be assigned via admin-managed workflows.
  if (role !== 'student') {
    return { error: 'Only student role can be selected during onboarding.' };
  }

  await db
    .update(users)
    .set({ platformRole: role, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  redirect('/dashboard');
}
