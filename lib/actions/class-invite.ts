'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requirePermission, can } from '@/lib/auth/permissions';
import { getCurrentUserOrNull } from '@/lib/auth/user';
import type { PlatformRole } from '@/lib/db/schema';
import {
  getInviteByToken,
  isInviteValid,
  getActiveInviteForClass,
  createClassInvite,
  regenerateClassInvite,
  incrementInviteUses,
} from '@/lib/db/queries/class-invites';
import {
  hasActiveEnrollment,
  hasTeacherAssignment,
  enrollStudent,
  getClassById,
} from '@/lib/db/queries/education';
import { assertRateLimit, getRequestClientIp } from '@/lib/security/rate-limit';
import { assertValidOrigin } from '@/lib/security/csrf';

const CLASS_INVITE_COOKIE_NAME = 'class_invite_token';
const CLASS_INVITE_COOKIE_MAX_AGE = 60 * 30; // 30 minutes

export async function setClassInviteCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CLASS_INVITE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CLASS_INVITE_COOKIE_MAX_AGE,
  });
}

export async function clearClassInviteCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CLASS_INVITE_COOKIE_NAME);
}

function getFormDataFromArgs(args: [unknown, unknown?]): FormData | null {
  const a = args[0];
  const b = args[1];
  if (a instanceof FormData) return a;
  if (b instanceof FormData) return b;
  return null;
}

export async function setClassInviteCookieAndRedirectToSignUp(
  ...args: [unknown, unknown?]
): Promise<never> {
  await assertValidOrigin();
  const formData = getFormDataFromArgs(args);
  if (!formData) redirect('/sign-in');
  const token = formData.get('token');
  const path = formData.get('redirectPath');
  if (typeof token !== 'string' || !token.trim() || typeof path !== 'string' || !path.trim()) {
    redirect('/sign-in');
  }
  await setClassInviteCookie(token.trim());
  redirect(path);
}

export async function setClassInviteCookieAndRedirectToSignIn(
  ...args: [unknown, unknown?]
): Promise<never> {
  await assertValidOrigin();
  const formData = getFormDataFromArgs(args);
  if (!formData) redirect('/sign-in');
  const token = formData.get('token');
  const path = formData.get('redirectPath');
  if (typeof token !== 'string' || !token.trim() || typeof path !== 'string' || !path.trim()) {
    redirect('/sign-in');
  }
  await setClassInviteCookie(token.trim());
  redirect(path);
}

async function requireCanManageClassInvite(classId: string) {
  const user = await requirePermission('classes:read');
  if (can(user, 'classes:write')) return user;
  if ((user.platformRole as PlatformRole) === 'teacher' && await hasTeacherAssignment(classId, user.id)) return user;
  redirect('/dashboard');
}

export async function getInviteByTokenAction(token: string) {
  const clientIp = await getRequestClientIp();
  const rateLimit = await assertRateLimit({
    key: `invite-lookup:${clientIp}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) return null;

  const inv = await getInviteByToken(token);
  if (!inv || !isInviteValid(inv)) return null;
  return {
    classId: inv.classId,
    className: inv.className ?? undefined,
    token: inv.token,
  };
}

export type JoinClassWithInviteResult =
  | { success: true; classId: string }
  | { success: false; error: string };

export async function joinClassWithInviteFormAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertValidOrigin();
  const token = formData.get('token');
  if (typeof token !== 'string' || !token.trim()) {
    return { error: 'Invalid invite' };
  }
  const result = await joinClassWithInviteAction(token.trim());
  if (result.success) {
    redirect('/dashboard/student');
  }
  return { error: result.error };
}

export async function joinClassWithInviteAction(
  token: string
): Promise<JoinClassWithInviteResult> {
  const user = await getCurrentUserOrNull();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const clientIp = await getRequestClientIp();
  const rateLimit = await assertRateLimit({
    key: `invite-join:${user.id}:${clientIp}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return {
      success: false,
      error: `Too many join attempts. Please retry in ${rateLimit.retryAfterSeconds}s.`,
    };
  }

  const role = user.platformRole as PlatformRole | null;
  if (role !== 'student') {
    return { success: false, error: 'Only students can join a class via invite link' };
  }

  const inv = await getInviteByToken(token);
  if (!inv || !isInviteValid(inv)) {
    return { success: false, error: 'Invalid or expired invite' };
  }

  const alreadyEnrolled = await hasActiveEnrollment(inv.classId, user.id);
  if (alreadyEnrolled) {
    return { success: true, classId: inv.classId };
  }

  try {
    await enrollStudent({ classId: inv.classId, studentUserId: user.id });
  } catch (err) {
    const isUniqueViolation =
      err instanceof Error && 'code' in err && (err as { code?: string }).code === '23505';
    if (isUniqueViolation) {
      return { success: true, classId: inv.classId };
    }
    throw err;
  }

  await incrementInviteUses(token);
  return { success: true, classId: inv.classId };
}

export async function getActiveInviteForClassAction(classId: string) {
  await requireCanManageClassInvite(classId);
  const invite = await getActiveInviteForClass(classId);
  if (!invite) return null;
  const eduClass = await getClassById(classId);
  return {
    token: invite.token,
    className: eduClass?.name ?? null,
    usesCount: invite.usesCount,
  };
}

export async function createOrGetClassInviteAction(classId: string) {
  const user = await requireCanManageClassInvite(classId);
  const existing = await getActiveInviteForClass(classId);
  if (existing) {
    return { token: existing.token };
  }
  const created = await createClassInvite(classId, user.id);
  return { token: created.token };
}

export async function createOrGetClassInviteFormAction(
  _prev: { token: string | null; error: string | null },
  formData: FormData
): Promise<{ token: string | null; error: string | null }> {
  await assertValidOrigin();
  const classId = formData.get('classId');
  if (typeof classId !== 'string' || !classId.trim()) {
    return { token: null, error: 'Invalid request' };
  }
  try {
    const result = await createOrGetClassInviteAction(classId.trim());
    return { token: result?.token ?? null, error: null };
  } catch {
    return { token: null, error: 'Failed to generate link' };
  }
}

export async function regenerateClassInviteAction(classId: string) {
  const user = await requireCanManageClassInvite(classId);
  await regenerateClassInvite(classId, user.id);
  redirect(`/dashboard/admin/classes/${classId}`);
}

export async function regenerateClassInviteFormAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error: string | null }> {
  await assertValidOrigin();
  const classId = formData.get('classId');
  if (typeof classId !== 'string' || !classId.trim()) return { error: 'Invalid request' };
  await regenerateClassInviteAction(classId.trim());
  return { error: null };
}

export async function consumeClassInviteCookieAndRedirect(
  userId: number,
  platformRole: PlatformRole | null
): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLASS_INVITE_COOKIE_NAME)?.value;
  if (!token?.trim()) return;
  if (platformRole !== 'student') return;

  const inv = await getInviteByToken(token.trim());
  if (!inv || !isInviteValid(inv)) {
    await clearClassInviteCookie();
    return;
  }

  const alreadyEnrolled = await hasActiveEnrollment(inv.classId, userId);
  if (!alreadyEnrolled) {
    try {
      await enrollStudent({ classId: inv.classId, studentUserId: userId });
      await incrementInviteUses(token.trim());
    } catch {
      // e.g. duplicate — treat as joined
    }
  }
  await clearClassInviteCookie();
  redirect('/dashboard/student');
}
