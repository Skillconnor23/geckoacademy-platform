'use server';

import { db } from '@/lib/db/drizzle';
import { funnelEvents } from '@/lib/db/schema';

export type FunnelEventName =
  | 'landing_page_cta_clicked'
  | 'funnel_started'
  | 'question_answered'
  | 'trial_time_selected'
  | 'trial_booked';

export async function trackFunnelEvent(
  event: FunnelEventName,
  properties?: Record<string, unknown>,
  locale?: string
): Promise<void> {
  try {
    await db.insert(funnelEvents).values({
      event,
      properties: properties ?? {},
      locale: locale ?? null,
    });
  } catch (e) {
    console.error('Funnel event tracking failed:', e);
  }
}
