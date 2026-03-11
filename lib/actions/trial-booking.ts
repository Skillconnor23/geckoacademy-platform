'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { trialBookings } from '@/lib/db/schema';
import { TRIAL_SLOTS_UTAH } from '@/lib/trial/config';
import { trackFunnelEvent } from '@/lib/actions/funnel-events';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

const createTrialBookingSchema = z.object({
  fullName: z.string().min(1).max(200).trim(),
  phone: z.string().min(1).max(50).trim(),
  email: z.string().email().optional().or(z.literal('')),
  slotId: z.string().min(1).max(50),
  slotLabel: z.string().min(1),
  trialTime: z.string().optional(),
  recommendedLevel: z.string().optional(),
  learnerType: z.string().optional(),
  locale: z.string().optional(),
  questionnaireAnswers: z.record(z.unknown()).optional(),
});

export type CreateTrialBookingInput = z.infer<typeof createTrialBookingSchema>;

export async function createTrialBookingAction(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const raw = {
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    slotId: formData.get('slotId'),
    slotLabel: formData.get('slotLabel'),
    trialTime: formData.get('trialTime') || undefined,
    recommendedLevel: formData.get('recommendedLevel') || undefined,
    learnerType: formData.get('learnerType') || undefined,
    locale: formData.get('locale') || undefined,
    questionnaireAnswers: formData.get('questionnaireAnswers')
      ? JSON.parse(String(formData.get('questionnaireAnswers')))
      : undefined,
  };

  const parsed = createTrialBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  const slot = TRIAL_SLOTS_UTAH.find((s) => s.id === parsed.data.slotId);
  if (!slot) {
    return { error: 'Invalid slot' };
  }

  try {
    const trialTime = parsed.data.trialTime
      ? new Date(parsed.data.trialTime)
      : null;

    await db.insert(trialBookings).values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      slotId: parsed.data.slotId,
      slotLabel: parsed.data.slotLabel,
      trialTime,
      recommendedLevel: parsed.data.recommendedLevel || null,
      learnerType: parsed.data.learnerType || null,
      locale: parsed.data.locale || null,
      questionnaireAnswers: parsed.data.questionnaireAnswers
        ? (parsed.data.questionnaireAnswers as Record<string, unknown>)
        : null,
      updatedAt: new Date(),
    });

    await trackFunnelEvent(
      'trial_booked',
      {
        slotId: parsed.data.slotId,
        learnerType: parsed.data.learnerType,
        level: parsed.data.recommendedLevel,
      },
      parsed.data.locale ?? undefined
    );

    const locale = (await getLocale()) || 'en';
    const params = new URLSearchParams({
      name: parsed.data.fullName,
      slot: parsed.data.slotLabel,
      phone: parsed.data.phone,
    });
    if (parsed.data.email) params.set('email', parsed.data.email);
    redirect(`/${locale}/trial/confirmed?${params.toString()}`);
  } catch (e) {
    console.error('Trial booking failed:', e);
    return { error: 'Booking failed. Please try again.' };
  }
}
