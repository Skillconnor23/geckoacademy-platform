#!/usr/bin/env npx tsx
/**
 * Debug script: Inspect the most recent platform invite row.
 * Usage: pnpm exec tsx scripts/inspect-platform-invite.ts [token]
 * If token is provided, tests whether that token would validate (by hash lookup).
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { desc } from 'drizzle-orm';
import { db } from '../lib/db/drizzle';
import { platformInvites } from '../lib/db/schema';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function normalizeToken(token: string): string {
  const t = typeof token === 'string' ? token.trim() : '';
  if (!t) return '';
  return /^[0-9a-fA-F]+$/.test(t) ? t.toLowerCase() : t;
}

async function main() {
  const testToken = process.argv[2];

  const [latest] = await db
    .select({
      id: platformInvites.id,
      email: platformInvites.email,
      platformRole: platformInvites.platformRole,
      schoolId: platformInvites.schoolId,
      classId: platformInvites.classId,
      tokenHash: platformInvites.tokenHash,
      expiresAt: platformInvites.expiresAt,
      usedAt: platformInvites.usedAt,
      invitedByUserId: platformInvites.invitedByUserId,
      createdAt: platformInvites.createdAt,
    })
    .from(platformInvites)
    .orderBy(desc(platformInvites.createdAt))
    .limit(1);

  if (!latest) {
    console.log('No platform invites in DB.');
    return;
  }

  const now = new Date();
  const expiresAt = latest.expiresAt instanceof Date ? latest.expiresAt : new Date(latest.expiresAt);

  console.log('--- Most recent platform invite ---');
  console.log('id:', latest.id);
  console.log('email:', latest.email);
  console.log('platform_role:', latest.platformRole);
  console.log('school_id:', latest.schoolId ?? null);
  console.log('class_id:', latest.classId ?? null);
  console.log('token_hash (first 16):', latest.tokenHash.slice(0, 16) + '...');
  console.log('token_hash length:', latest.tokenHash.length);
  console.log('created_at:', latest.createdAt);
  console.log('expires_at:', expiresAt.toISOString());
  console.log('used_at:', latest.usedAt ?? null);
  console.log('invited_by_user_id:', latest.invitedByUserId);
  console.log('--- Validation ---');
  console.log('expired?', expiresAt <= now ? 'YES' : 'NO');
  console.log('already used?', latest.usedAt ? 'YES' : 'NO');

  if (testToken) {
    const normalized = normalizeToken(testToken);
    const hash = hashToken(normalized);
    const matches = hash === latest.tokenHash;
    console.log('--- Token test ---');
    console.log('provided token length:', testToken.length);
    console.log('normalized length:', normalized.length);
    console.log('hash matches stored?', matches ? 'YES' : 'NO');
    if (!matches) {
      console.log('computed hash (first 16):', hash.slice(0, 16) + '...');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
