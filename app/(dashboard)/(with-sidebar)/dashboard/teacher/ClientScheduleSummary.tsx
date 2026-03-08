'use client';

import { formatScheduleTimeInViewerTz } from '@/lib/schedule/tz';
import { useViewerTimezone } from '@/lib/hooks/use-viewer-timezone';

const DAY_DISPLAY: Record<string, string> = {
  sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat',
};

function formatScheduleSummary(
  c: {
    scheduleDays: unknown;
    scheduleStartTime: string | null;
    scheduleTimezone: string | null;
    geckoLevel: string | null;
  },
  viewerTz: string,
  referenceDate?: Date | string
): string {
  const days = Array.isArray(c.scheduleDays)
    ? (c.scheduleDays as string[]).map((d) =>
        DAY_DISPLAY[d?.toLowerCase?.().slice(0, 3)] ?? d
      ).filter(Boolean)
    : [];
  const classTz = c.scheduleTimezone ?? 'Asia/Ulaanbaatar';
  const timeStr = formatScheduleTimeInViewerTz(
    c.scheduleStartTime,
    classTz,
    viewerTz,
    referenceDate
  );
  const time = classTz !== viewerTz ? `${timeStr} (your time)` : timeStr;
  const level = c.geckoLevel ?? '';
  const parts = [days.length ? days.join(' & ') : null, time, level].filter(Boolean);
  return parts.join(' · ') || '—';
}

type Props = {
  classData: {
    scheduleDays: unknown;
    scheduleStartTime: string | null;
    scheduleTimezone: string | null;
    geckoLevel: string | null;
  };
  serverTimezoneFallback: string;
  /** Actual occurrence/session date for DST-correct conversion; falls back to today when omitted */
  referenceDate?: Date | string;
};

export function ClientScheduleSummary({
  classData,
  serverTimezoneFallback,
  referenceDate,
}: Props) {
  const tz = useViewerTimezone(serverTimezoneFallback);
  return <>{formatScheduleSummary(classData, tz, referenceDate)}</>;
}
