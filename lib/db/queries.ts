import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { auth } from '@/auth';
import {
  CONNOR_ADMIN_EMAIL,
  getImpersonateUserIdFromCookie,
} from '@/lib/auth/impersonate';

export async function getUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const email = (session.user as { email?: string }).email?.trim().toLowerCase();
  const impersonateId =
    email === CONNOR_ADMIN_EMAIL ? await getImpersonateUserIdFromCookie() : null;

  const userIdToLoad = impersonateId ?? (session.user.id as number);
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userIdToLoad), isNull(users.deletedAt)))
    .limit(1);

  return user ?? null;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

/** Get team for a user by ID. Use this when session is not yet available (e.g. right after signIn). */
export async function getTeamForUserId(userId: number) {
  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  return result?.team || null;
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function updateUserTimezone(userId: number, timezone: string) {
  await db
    .update(users)
    .set({ timezone, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserName(userId: number, name: string | null) {
  await db
    .update(users)
    .set({ name: name?.trim() || null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateAvatarUrl(userId: number, avatarUrl: string | null) {
  await db
    .update(users)
    .set({ avatarUrl: avatarUrl?.trim() || null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
