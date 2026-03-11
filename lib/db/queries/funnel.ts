/**
 * Funnel analytics queries for admin dashboard.
 * Use these to compute: Landing visits, Funnel starts, Trial bookings, Button CTR.
 */
import { db } from '@/lib/db/drizzle';
import { funnelEvents, trialBookings } from '@/lib/db/schema';
import { count, and, gte, eq } from 'drizzle-orm';

export async function getFunnelStats(startDate?: Date) {
  const dateFilter = startDate ? gte(funnelEvents.createdAt, startDate) : undefined;

  const [landingResult, funnelResult, trialResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(funnelEvents)
      .where(
        dateFilter
          ? and(eq(funnelEvents.event, 'landing_page_cta_clicked'), dateFilter)
          : eq(funnelEvents.event, 'landing_page_cta_clicked')
      ),
    db
      .select({ count: count() })
      .from(funnelEvents)
      .where(
        dateFilter
          ? and(eq(funnelEvents.event, 'funnel_started'), dateFilter)
          : eq(funnelEvents.event, 'funnel_started')
      ),
    startDate
      ? db
          .select({ count: count() })
          .from(trialBookings)
          .where(gte(trialBookings.createdAt, startDate))
      : db.select({ count: count() }).from(trialBookings),
  ]);

  const landingClicks = landingResult[0]?.count ?? 0;
  const funnelStarts = funnelResult[0]?.count ?? 0;
  const trialBookedCount = trialResult[0]?.count ?? 0;
  const ctr =
    funnelStarts > 0 ? ((landingClicks / funnelStarts) * 100).toFixed(1) : '0';

  return {
    landingPageCtaClicks: Number(landingClicks),
    funnelStarts: Number(funnelStarts),
    trialBookings: Number(trialBookedCount),
    ctrPercent: ctr,
  };
}
