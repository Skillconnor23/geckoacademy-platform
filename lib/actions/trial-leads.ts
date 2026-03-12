'use server';

import { randomBytes, createHash } from 'crypto';
import { eq, and, gt, desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  trialLeads,
  trialBookings,
  trialAccessTokens,
  type TrialLeadStatus,
} from '@/lib/db/schema';

const TOKEN_BYTES = 32;
const TOKEN_EXPIRY_DAYS = 14;
const LOG_PREFIX = '[trial-leads]';
const isDev = process.env.NODE_ENV === 'development';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/** Find or create trial lead by email. Returns the lead and whether it was created. */
export async function findOrCreateTrialLeadByEmail(
  email: string,
  data: {
    name?: string;
    phone?: string;
    learnerType?: string;
    locale?: string;
    selfSelectedLevel?: string;
    recommendedLevel?: string;
    source?: string;
  }
): Promise<{ lead: typeof trialLeads.$inferSelect; created: boolean }> {
  if (isDev) console.log(LOG_PREFIX, 'findOrCreateTrialLeadByEmail', email);
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error('Email required');

  const existing = await db
    .select()
    .from(trialLeads)
    .where(eq(trialLeads.email, normalized))
    .limit(1);

  if (existing[0]) {
    const updates: Partial<typeof trialLeads.$inferInsert> = { updatedAt: new Date() };
    if (data.name && !existing[0].name) updates.name = data.name;
    if (data.phone && !existing[0].phone) updates.phone = data.phone;
    if (data.learnerType) updates.learnerType = data.learnerType;
    if (data.locale) updates.locale = data.locale;
    if (data.selfSelectedLevel) updates.selfSelectedLevel = data.selfSelectedLevel;
    if (data.recommendedLevel) updates.recommendedLevel = data.recommendedLevel;
    if (data.source && !existing[0].source) updates.source = data.source;

    if (Object.keys(updates).length > 1) {
      const [updated] = await db
        .update(trialLeads)
        .set(updates)
        .where(eq(trialLeads.id, existing[0].id))
        .returning();
      return { lead: updated ?? existing[0], created: false };
    }
    return { lead: existing[0], created: false };
  }

  const [inserted] = await db
    .insert(trialLeads)
    .values({
      email: normalized,
      name: data.name ?? null,
      phone: data.phone ?? null,
      learnerType: data.learnerType ?? null,
      locale: data.locale ?? null,
      selfSelectedLevel: data.selfSelectedLevel ?? null,
      recommendedLevel: data.recommendedLevel ?? null,
      source: data.source ?? null,
      status: 'started',
    })
    .returning();

  if (!inserted) throw new Error('Failed to create trial lead');
  if (isDev) console.log(LOG_PREFIX, 'findOrCreateTrialLeadByEmail created', inserted.id);
  return { lead: inserted, created: true };
}

/** Find or create trial lead by phone (fallback when no email). */
export async function findOrCreateTrialLeadByPhone(
  phone: string,
  data: {
    name?: string;
    email?: string;
    learnerType?: string;
    locale?: string;
    selfSelectedLevel?: string;
    recommendedLevel?: string;
    source?: string;
  }
): Promise<{ lead: typeof trialLeads.$inferSelect; created: boolean }> {
  if (isDev) console.log(LOG_PREFIX, 'findOrCreateTrialLeadByPhone', phone);
  const normalized = phone.trim();
  if (!normalized) throw new Error('Phone required');

  const existing = await db
    .select()
    .from(trialLeads)
    .where(eq(trialLeads.phone, normalized))
    .limit(1);

  if (existing[0]) {
    const updates: Partial<typeof trialLeads.$inferInsert> = { updatedAt: new Date() };
    if (data.name && !existing[0].name) updates.name = data.name;
    if (data.email) updates.email = data.email.trim().toLowerCase();
    if (data.learnerType) updates.learnerType = data.learnerType;
    if (data.locale) updates.locale = data.locale;
    if (data.selfSelectedLevel) updates.selfSelectedLevel = data.selfSelectedLevel;
    if (data.recommendedLevel) updates.recommendedLevel = data.recommendedLevel;
    if (data.source && !existing[0].source) updates.source = data.source;

    if (Object.keys(updates).length > 1) {
      const [updated] = await db
        .update(trialLeads)
        .set(updates)
        .where(eq(trialLeads.id, existing[0].id))
        .returning();
      return { lead: updated ?? existing[0], created: false };
    }
    return { lead: existing[0], created: false };
  }

  const [inserted] = await db
    .insert(trialLeads)
    .values({
      phone: normalized,
      name: data.name ?? null,
      email: data.email ? data.email.trim().toLowerCase() : null,
      learnerType: data.learnerType ?? null,
      locale: data.locale ?? null,
      selfSelectedLevel: data.selfSelectedLevel ?? null,
      recommendedLevel: data.recommendedLevel ?? null,
      source: data.source ?? null,
      status: 'started',
    })
    .returning();

  if (!inserted) throw new Error('Failed to create trial lead');
  if (isDev) console.log(LOG_PREFIX, 'findOrCreateTrialLeadByPhone created', inserted.id);
  return { lead: inserted, created: true };
}

/** Update trial lead with placement test result. */
export async function updateTrialLeadPlacement(
  leadId: string,
  data: {
    placementScore: number;
    placementLevel: string;
    placementAnswers?: Record<string, unknown>;
  }
): Promise<void> {
  await db
    .update(trialLeads)
    .set({
      placementScore: data.placementScore,
      placementLevel: data.placementLevel,
      placementAnswers: data.placementAnswers ?? {},
      placementCompletedAt: new Date(),
      recommendedLevel: data.placementLevel,
      status: 'placement_completed' as TrialLeadStatus,
      updatedAt: new Date(),
    })
    .where(eq(trialLeads.id, leadId));
}

/** Update trial lead status. */
export async function updateTrialLeadStatus(
  leadId: string,
  status: TrialLeadStatus
): Promise<void> {
  await db
    .update(trialLeads)
    .set({ status, updatedAt: new Date() })
    .where(eq(trialLeads.id, leadId));
}

/** Create trial access token for portal. Returns raw token (to put in URL). */
export async function createTrialAccessToken(
  trialLeadId: string
): Promise<{ token: string; expiresAt: Date }> {
  if (isDev) console.log(LOG_PREFIX, 'createTrialAccessToken', trialLeadId);
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(trialAccessTokens).values({
    trialLeadId,
    tokenHash,
    expiresAt,
  });
  if (isDev) console.log(LOG_PREFIX, 'createTrialAccessToken success');

  return { token, expiresAt };
}

/** Validate trial access token. Returns trial lead id if valid. Updates lastUsedAt. */
export async function validateTrialAccessToken(
  token: string
): Promise<{ trialLeadId: string } | null> {
  const tokenHash = hashToken(token);
  const now = new Date();

  const [row] = await db
    .select({
      id: trialAccessTokens.id,
      trialLeadId: trialAccessTokens.trialLeadId,
    })
    .from(trialAccessTokens)
    .where(
      and(
        eq(trialAccessTokens.tokenHash, tokenHash),
        gt(trialAccessTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(trialAccessTokens)
    .set({ lastUsedAt: now })
    .where(eq(trialAccessTokens.id, row.id));

  return { trialLeadId: row.trialLeadId };
}

/** Get trial lead with latest booking. */
export async function getTrialLeadWithBooking(trialLeadId: string) {
  const [lead] = await db
    .select()
    .from(trialLeads)
    .where(eq(trialLeads.id, trialLeadId))
    .limit(1);

  if (!lead) return null;

  const [latestBooking] = await db
    .select()
    .from(trialBookings)
    .where(eq(trialBookings.trialLeadId, trialLeadId))
    .orderBy(desc(trialBookings.createdAt))
    .limit(1);

  return { lead, booking: latestBooking ?? null };
}
