'use server';

import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { createPasswordResetToken } from '@/lib/auth/password-reset';

const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
});

export async function submitForgotPassword(
  _prev: { submitted?: boolean } | null,
  formData: FormData
) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email')?.toString()?.trim(),
  });

  if (!parsed.success) {
    return { submitted: true };
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      and(eq(users.email, parsed.data.email), isNull(users.deletedAt))
    )
    .limit(1);

  if (user && !users.deletedAt) {
    await createPasswordResetToken(user.id, user.email);
  }

  return { submitted: true };
}
