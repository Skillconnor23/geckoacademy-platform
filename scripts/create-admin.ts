/**
 * DEV-ONLY: Create or upsert an app admin user.
 * Usage: pnpm create-admin <email> <password>
 *
 * - Creates the user if missing
 * - Updates password, emailVerified, platformRole if user exists
 * Uses dotenv and the same hashPassword as auth.ts authorize()
 */
import 'dotenv/config';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers } from '../lib/db/schema';
import { hashPassword } from '../lib/auth/session';

const ENABLED =
  process.env.ENABLE_DEV_RECOVERY === 'true' ||
  process.env.NODE_ENV !== 'production';

const ADMIN_EMAIL = 'connor@geckoteach.com';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function main() {
  const password = process.argv[2];

  if (!ENABLED) {
    console.error('Script disabled. Set ENABLE_DEV_RECOVERY=true or NODE_ENV=development');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('Usage: pnpm create-admin <password>');
    console.error('  password - Min 8 characters (required)');
    process.exit(1);
  }

  const email = normalizeEmail(ADMIN_EMAIL);

  const [existing] = await db
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      platformRole: users.platformRole,
    })
    .from(users)
    .where(
      and(
        sql`lower(${users.email}) = lower(${email})`,
        isNull(users.deletedAt)
      )
    )
    .limit(1);

  const passwordHash = await hashPassword(password);

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        emailVerified: new Date(),
        platformRole: 'admin',
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));

    const dbHost = process.env.POSTGRES_URL
      ? new URL(process.env.POSTGRES_URL.replace('postgresql://', 'https://')).hostname
      : 'unknown';

    console.log('Updated existing admin user:');
    console.log('  email:', existing.email, '(normalized:', email + ')');
    console.log('  emailVerified: true');
    console.log('  platformRole: admin');
    console.log('  DB:', dbHost);
    console.log('Sign in at your app with the password you provided.');
  } else {
    await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        email,
        passwordHash,
        role: 'owner',
        platformRole: 'admin',
        emailVerified: new Date(),
      }).returning();

      if (!user) throw new Error('User insert failed');

      const [team] = await tx.insert(teams).values({
        name: `${email}'s Team`,
      }).returning();

      if (!team) throw new Error('Team insert failed');

      await tx.insert(teamMembers).values({
        userId: user.id,
        teamId: team.id,
        role: 'owner',
      });
    });

    const dbHost = process.env.POSTGRES_URL
      ? new URL(process.env.POSTGRES_URL.replace('postgresql://', 'https://')).hostname
      : 'unknown';

    console.log('Created new admin user:');
    console.log('  email:', email);
    console.log('  emailVerified: true');
    console.log('  platformRole: admin');
    console.log('  DB:', dbHost);
    console.log('Sign in at your app with the password you provided.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
