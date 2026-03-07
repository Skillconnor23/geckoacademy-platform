export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getTranslations, getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getInviteByTokenAction } from '@/lib/actions/class-invite';
import { getCurrentUserOrNull } from '@/lib/auth/user';
import type { PlatformRole } from '@/lib/db/schema';
import { defaultLocale } from '@/lib/i18n/config';
import { JoinInviteClient } from './JoinInviteClient';

const CLASS_INVITE_COOKIE_NAME = 'class_invite_token';
const COOKIE_MAX_AGE = 60 * 30; // 30 minutes (match setClassInviteCookie)

/** Fallback labels when i18n is unavailable (e.g. route without locale). */
const FALLBACK_LABELS = {
  invalidOrExpired: 'This invite link is invalid or has expired.',
  invalidOrExpiredHelp: 'Please ask your teacher or school for a new invite link.',
  joinThisClass: 'Join this class',
  classLabel: 'Class',
  createStudentAccount: 'Create student account',
  logIn: 'Log in',
  onlyStudentsCanJoin: 'Only student accounts can join a class via this link. Please sign in with a student account.',
} as const;

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ token?: string }>;
}) {
  const resolvedParams = await params;
  const token = typeof resolvedParams?.token === 'string' && resolvedParams.token.trim()
    ? resolvedParams.token.trim()
    : null;

  let t: (key: string) => string;
  let locale: string;
  try {
    locale = (await getLocale()) || defaultLocale;
    const tJoin = await getTranslations('join.invite');
    t = (k: string) => tJoin(k);
  } catch {
    locale = defaultLocale;
    t = (k: string) => (k in FALLBACK_LABELS ? FALLBACK_LABELS[k as keyof typeof FALLBACK_LABELS] : k);
  }

  if (!token) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[#111827]">{t('invalidOrExpired')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('invalidOrExpiredHelp')}</p>
        </div>
      </main>
    );
  }

  const invite = await getInviteByTokenAction(token);
  const user = await getCurrentUserOrNull().catch(() => null);
  const signInPath = `/${locale}/sign-in`;
  const signUpPath = `/${locale}/sign-up`;

  if (!invite) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[#111827]">{t('invalidOrExpired')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('invalidOrExpiredHelp')}</p>
        </div>
      </main>
    );
  }

  const isStudent = (user?.platformRole as PlatformRole) === 'student';
  const isLoggedInAsStudent = !!user && isStudent;

  if (!user) {
    const cookieStore = await cookies();
    cookieStore.set(CLASS_INVITE_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#111827]">{t('joinThisClass')}</h1>
        {invite.className && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t('classLabel')}: <span className="font-medium text-foreground">{invite.className}</span>
          </p>
        )}
        <div className="mt-6">
          <JoinInviteClient
            token={token}
            isLoggedInAsStudent={isLoggedInAsStudent}
            signInPath={signInPath}
            signUpPath={signUpPath}
            labels={{
              joinThisClass: t('joinThisClass'),
              createStudentAccount: t('createStudentAccount'),
              logIn: t('logIn'),
            }}
          />
        </div>
        {user && !isStudent && (
          <p className="mt-4 text-sm text-amber-600">{t('onlyStudentsCanJoin')}</p>
        )}
      </div>
    </main>
  );
}
