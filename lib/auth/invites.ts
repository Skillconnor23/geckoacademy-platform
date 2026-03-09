import { randomBytes } from 'crypto';
import { createHash } from 'crypto';
import { eq, and, gt, isNull, sql } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/config/url';
import { db } from '@/lib/db/drizzle';
import {
  platformInvites,
  schools,
  eduClasses,
} from '@/lib/db/schema';
import type { PlatformInviteRole } from '@/lib/db/schema';
import { sendPlatformInviteEmail } from './email';

const TOKEN_BYTES = 32;
const EXPIRY_DAYS = 7;

/** Hex tokens are case-insensitive; normalize to lowercase so URL/email pipeline changes don't break lookup. */
function normalizeToken(token: string): string {
  const t = typeof token === 'string' ? token.trim() : '';
  if (!t) return '';
  return /^[0-9a-fA-F]+$/.test(t) ? t.toLowerCase() : t;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

export type CreatePlatformInviteParams = {
  email: string;
  platformRole: PlatformInviteRole;
  schoolId?: string | null;
  classId?: string | null;
  invitedByUserId: number;
  locale?: string | null;
};

export async function createPlatformInvite(
  params: CreatePlatformInviteParams
): Promise<{ ok: true; inviteLink: string } | { ok: false; error: string }> {
  const { email, platformRole, schoolId, classId, invitedByUserId, locale } = params;

  if (platformRole === 'school_admin' && !schoolId) {
    return { ok: false, error: 'School is required for school_admin invites' };
  }
  if (platformRole === 'student' && !classId) {
    return { ok: false, error: 'Class is required for student invites' };
  }

  if (platformRole === 'student' && classId) {
    const [existing] = await db
      .select({ id: platformInvites.id })
      .from(platformInvites)
      .where(
        and(
          sql`lower(${platformInvites.email}) = lower(${email})`,
          eq(platformInvites.platformRole, 'student'),
          eq(platformInvites.classId, classId),
          isNull(platformInvites.usedAt),
          gt(platformInvites.expiresAt, new Date())
        )
      )
      .limit(1);
    if (existing) {
      return { ok: false, error: 'A pending student invite for this email and class already exists.' };
    }
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(platformInvites).values({
    email,
    platformRole,
    schoolId: schoolId ?? null,
    classId: classId ?? null,
    tokenHash,
    expiresAt,
    invitedByUserId,
  });

  let schoolName: string | null = null;
  let className: string | null = null;
  if (schoolId && platformRole === 'school_admin') {
    const [s] = await db.select({ name: schools.name }).from(schools).where(eq(schools.id, schoolId)).limit(1);
    schoolName = s?.name ?? null;
  }
  if (classId && platformRole === 'student') {
    const [c] = await db.select({ name: eduClasses.name }).from(eduClasses).where(eq(eduClasses.id, classId)).limit(1);
    className = c?.name ?? null;
  }

  const baseUrl = getBaseUrl();
  const localePrefix = locale && ['en', 'mn'].includes(locale) ? locale : 'en';
  const inviteLink = `${baseUrl}/${localePrefix}/accept-invite?token=${encodeURIComponent(token)}`;

  await sendPlatformInviteEmail(email, platformRole, schoolName, className, token, locale);

  return { ok: true, inviteLink };
}

export type ValidateInviteRejectReason =
  | 'empty_token'
  | 'token_not_found'
  | 'already_used'
  | 'expired'
  | 'db_error';

/** Validate invite without consuming. Use for redirect flow. */
export async function validatePlatformInvite(token: string): Promise<
  | { ok: true; email: string; platformRole: PlatformInviteRole; schoolId: string | null; classId: string | null }
  | { ok: false; error: string; reason?: ValidateInviteRejectReason }
> {
  const tokenNormalized = normalizeToken(token);
  if (!tokenNormalized) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[validatePlatformInvite] Rejected: empty_token');
    }
    return { ok: false, error: 'Invalid or expired invite', reason: 'empty_token' };
  }

  const tokenHash = hashToken(tokenNormalized);
  const now = new Date();

  let invite: (typeof platformInvites.$inferSelect) | undefined;
  try {
    [invite] = await db
      .select()
      .from(platformInvites)
      .where(eq(platformInvites.tokenHash, tokenHash))
      .limit(1);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[validatePlatformInvite] Rejected: db_error (ensure migrations run: pnpm db:migrate):', err);
    }
    return { ok: false, error: 'Invalid or expired invite', reason: 'db_error' };
  }

  if (!invite) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[validatePlatformInvite] Rejected: token_not_found', {
        tokenLen: tokenNormalized.length,
        expectedHexLen: 64,
      });
    }
    return { ok: false, error: 'Invalid or expired invite', reason: 'token_not_found' };
  }

  if (invite.usedAt) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[validatePlatformInvite] Rejected: already_used');
    }
    return { ok: false, error: 'Invalid or expired invite', reason: 'already_used' };
  }

  const expiresAt = invite.expiresAt instanceof Date ? invite.expiresAt : new Date(invite.expiresAt);
  if (expiresAt <= now) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[validatePlatformInvite] Rejected: expired', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
      });
    }
    return { ok: false, error: 'Invalid or expired invite', reason: 'expired' };
  }

  return {
    ok: true,
    email: invite.email,
    platformRole: invite.platformRole as PlatformInviteRole,
    schoolId: invite.schoolId ?? null,
    classId: invite.classId ?? null,
  };
}

/** Consume invite and return data. Call only when applying role. */
export async function consumePlatformInvite(token: string): Promise<
  | { ok: true; email: string; platformRole: PlatformInviteRole; schoolId: string | null; classId: string | null }
  | { ok: false; error: string }
> {
  const tokenNormalized = normalizeToken(token);
  const result = await validatePlatformInvite(token);
  if (!result.ok) return result;

  const tokenHash = hashToken(tokenNormalized);
  const now = new Date();

  await db
    .update(platformInvites)
    .set({ usedAt: now })
    .where(eq(platformInvites.tokenHash, tokenHash));

  return result;
}

/** Alias for backwards compatibility. */
export const acceptPlatformInvite = consumePlatformInvite;
