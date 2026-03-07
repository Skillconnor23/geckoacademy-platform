import { desc, eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { platformInvites, schools, users } from '../schema';
export type PlatformInviteWithDetails = {
  id: string;
  email: string;
  platformRole: string;
  schoolId: string | null;
  schoolName: string | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  invitedByUserId: number;
  invitedByName: string | null;
  /** pending | accepted | expired */
  status: 'pending' | 'accepted' | 'expired';
};

function toStatus(row: { usedAt: Date | null; expiresAt: Date }): 'pending' | 'accepted' | 'expired' {
  const now = new Date();
  if (row.usedAt) return 'accepted';
  if (row.expiresAt < now) return 'expired';
  return 'pending';
}

/** List platform invites for admin. Filter by schoolId for school_admin. */
export async function listPlatformInvites(schoolIdFilter?: string | null): Promise<PlatformInviteWithDetails[]> {
  const baseQuery = db
    .select({
      id: platformInvites.id,
      email: platformInvites.email,
      platformRole: platformInvites.platformRole,
      schoolId: platformInvites.schoolId,
      expiresAt: platformInvites.expiresAt,
      usedAt: platformInvites.usedAt,
      createdAt: platformInvites.createdAt,
      invitedByUserId: platformInvites.invitedByUserId,
      schoolName: schools.name,
      invitedByName: users.name,
    })
    .from(platformInvites)
    .leftJoin(schools, eq(platformInvites.schoolId, schools.id))
    .leftJoin(users, eq(platformInvites.invitedByUserId, users.id));

  const rows = schoolIdFilter
    ? await baseQuery.where(eq(platformInvites.schoolId, schoolIdFilter)).orderBy(desc(platformInvites.createdAt))
    : await baseQuery.orderBy(desc(platformInvites.createdAt));

  return (rows ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    platformRole: row.platformRole,
    schoolId: row.schoolId,
    schoolName: row.schoolName ?? null,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
    createdAt: row.createdAt,
    invitedByUserId: row.invitedByUserId,
    invitedByName: row.invitedByName ?? null,
    status: toStatus({ usedAt: row.usedAt, expiresAt: row.expiresAt }),
  }));
}

/** Revoke a platform invite by setting expiresAt to now. */
export async function revokePlatformInvite(id: string): Promise<boolean> {
  const [updated] = await db
    .update(platformInvites)
    .set({ expiresAt: new Date() })
    .where(eq(platformInvites.id, id))
    .returning({ id: platformInvites.id });
  return !!updated;
}
