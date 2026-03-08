/**
 * API auth helpers. Return JSON 401/403 instead of redirecting.
 * Use these only in API routes (/app/api/*).
 */

import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createAuditLog } from '@/lib/auth/audit';
import type { PlatformRole } from '@/lib/db/schema';

export type CurrentUser = Awaited<ReturnType<typeof getUser>>;

export type ApiAuthResult =
  | { user: NonNullable<CurrentUser>; response?: never }
  | { user?: never; response: NextResponse };

/**
 * Requires authentication. Returns { user } or 401 JSON response.
 */
export async function requireApiAuth(): Promise<ApiAuthResult> {
  const user = await getUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user };
}

/**
 * Requires authentication and one of the given platform roles.
 * Returns { user } or 401 (unauthenticated) / 403 (wrong role) JSON response.
 */
export async function requireApiRole(
  allowedRoles: PlatformRole[]
): Promise<
  | { user: NonNullable<CurrentUser> & { platformRole: PlatformRole }; response?: never }
  | { user?: never; response: NextResponse }
> {
  const user = await getUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  const role = user.platformRole as PlatformRole | null;
  if (!role) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  if (!allowedRoles.includes(role)) {
    createAuditLog({
      action: 'failed_privileged_access',
      userId: user.id,
      metadata: { requiredRoles: allowedRoles, hadRole: role },
    }).catch(() => {});
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { user: user as NonNullable<CurrentUser> & { platformRole: PlatformRole } };
}
