'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { geckoPlacementResults } from '@/lib/db/schema';
import { getCurrentUserOrNull, requireAuth } from '@/lib/auth/user';
import {
  findOrCreateTrialLeadByEmail,
  updateTrialLeadPlacement,
  validateTrialAccessToken,
} from '@/lib/actions/trial-leads';
import {
  PLACEMENT_QUESTIONS,
  GEKO_WEIGHTS,
  scoreToLevel,
  type GeckoLevel,
} from '@/lib/level-check/questions';

const PLACEMENT_COOKIE_LEVEL = 'placement_level';
const PLACEMENT_COOKIE_SCORE = 'placement_score';
const PLACEMENT_COOKIE_MAX_AGE = 60 * 60; // 1 hour

export type AnswerInput = {
  questionId: string;
  value: string | string[]; // string for multiple_choice/vocabulary, string[] for sentence_ordering
};

export type WritingInput = {
  questionId: string;
  value: string;
};

export type PlacementContext = {
  returnToken?: string | null;
  source?: string | null; // 'funnel' | 'portal' or undefined
  email?: string | null;
};

function computePlacementResult(
  answers: AnswerInput[],
  writingResponses: WritingInput[]
): { totalScore: number; placementLevel: GeckoLevel; answersRecord: Record<string, unknown>; writingRecord: Record<string, string> } {
  const answersMap = new Map(answers.map((a) => [a.questionId, a.value]));
  const writingMap = new Map(
    writingResponses.map((w) => [w.questionId, w.value] as const)
  );

  let totalScore = 0;

  for (const q of PLACEMENT_QUESTIONS) {
    const weight = GEKO_WEIGHTS[q.level as GeckoLevel];

    if (q.type === 'writing') {
      const text = writingMap.get(q.id)?.trim() ?? '';
      if (text.length >= 20) {
        totalScore += weight;
      } else if (text.length >= 5) {
        totalScore += Math.floor(weight / 2);
      }
      continue;
    }

    const userAnswer = answersMap.get(q.id);

    if (q.type === 'multiple_choice' || q.type === 'vocabulary') {
      const correctChoice = q.choices?.find((c) => c.correct);
      const correctValue = correctChoice?.value;
      if (
        userAnswer &&
        correctValue !== undefined &&
        String(userAnswer).trim().toLowerCase() === String(correctValue).trim().toLowerCase()
      ) {
        totalScore += weight;
      }
    } else if (q.type === 'sentence_ordering') {
      const userOrder = Array.isArray(userAnswer) ? userAnswer : [];
      const correctOrder = q.correctOrder ?? [];
      const userStr = userOrder.join(' ').trim().toLowerCase();
      const correctStr = correctOrder.join(' ').trim().toLowerCase();
      if (userStr === correctStr) {
        totalScore += weight;
      }
    }
  }

  const placementLevel = scoreToLevel(totalScore);
  const answersRecord: Record<string, unknown> = {};
  for (const a of answers) {
    answersRecord[a.questionId] = a.value;
  }
  const writingRecord: Record<string, string> = {};
  for (const w of writingResponses) {
    writingRecord[w.questionId] = w.value;
  }

  return { totalScore, placementLevel, answersRecord, writingRecord };
}

export async function submitPlacementAction(
  answers: AnswerInput[],
  writingResponses: WritingInput[] = [],
  context?: PlacementContext | null
) {
  const returnToken = context?.returnToken?.trim() || undefined;
  const source = context?.source?.trim() || undefined;
  const email = context?.email?.trim() || undefined;

  const { totalScore, placementLevel, answersRecord, writingRecord } = computePlacementResult(
    answers,
    writingResponses
  );

  const user = await getCurrentUserOrNull();
  const locale = await getLocale();
  const resultParams = new URLSearchParams({ score: String(totalScore), level: placementLevel });
  if (returnToken) resultParams.set('returnToken', returnToken);
  if (source) resultParams.set('source', source);

  const placementPayload = {
    placementScore: totalScore,
    placementLevel,
    placementAnswers: { ...answersRecord, ...writingRecord } as Record<string, unknown>,
  };

  // Authenticated: save to gecko_placement_results + trial lead by email
  if (user) {
    await db.insert(geckoPlacementResults).values({
      userId: user.id,
      placementScore: totalScore,
      placementLevel,
      answers: answersRecord,
      writingResponses: writingRecord,
    });

    const userEmail = user.email?.trim();
    if (userEmail) {
      try {
        const { lead } = await findOrCreateTrialLeadByEmail(userEmail, {
          name: user.name ?? undefined,
          recommendedLevel: placementLevel,
        });
        await updateTrialLeadPlacement(lead.id, placementPayload);
      } catch (e) {
        console.warn('Trial lead placement update failed:', e);
      }
    }

    redirect(`/${locale}/level-check/result?${resultParams.toString()}`);
  }

  // Unauthenticated trial flow: attach to trial lead when we have identity
  if (returnToken) {
    const valid = await validateTrialAccessToken(returnToken);
    if (valid) {
      await updateTrialLeadPlacement(valid.trialLeadId, placementPayload);
      redirect(`/${locale}/level-check/result?${resultParams.toString()}`);
    }
  }

  if (email) {
    try {
      const { lead } = await findOrCreateTrialLeadByEmail(email, {
        recommendedLevel: placementLevel,
      });
      await updateTrialLeadPlacement(lead.id, placementPayload);
      redirect(`/${locale}/level-check/result?${resultParams.toString()}`);
    } catch (e) {
      console.warn('Trial lead placement by email failed:', e);
    }
  }

  // No identity (e.g. source=funnel, no email yet): set cookies so booking form can attach placement to lead later
  const cookieStore = await cookies();
  cookieStore.set(PLACEMENT_COOKIE_LEVEL, placementLevel, { path: '/', maxAge: PLACEMENT_COOKIE_MAX_AGE });
  cookieStore.set(PLACEMENT_COOKIE_SCORE, String(totalScore), { path: '/', maxAge: PLACEMENT_COOKIE_MAX_AGE });
  redirect(`/${locale}/level-check/result?${resultParams.toString()}`);
}

/** Clear placement cookies (call after attaching placement to trial lead on booking). */
export async function clearPlacementCookies() {
  const cookieStore = await cookies();
  cookieStore.set(PLACEMENT_COOKIE_LEVEL, '', { path: '/', maxAge: 0 });
  cookieStore.set(PLACEMENT_COOKIE_SCORE, '', { path: '/', maxAge: 0 });
}

export async function getLatestPlacementResult() {
  const user = await requireAuth();
  const rows = await db
    .select()
    .from(geckoPlacementResults)
    .where(eq(geckoPlacementResults.userId, user.id))
    .orderBy(desc(geckoPlacementResults.createdAt))
    .limit(1);
  return rows[0] ?? null;
}
