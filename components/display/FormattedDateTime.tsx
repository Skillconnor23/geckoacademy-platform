'use client';

import { useViewerTimezone } from '@/lib/hooks/use-viewer-timezone';

type Props = {
  /** ISO string or Date - session/occurrence start */
  date: string | Date;
  /** User timezone from DB for SSR fallback */
  serverFallback: string;
  /** Intl options for the date part */
  dateOptions?: Intl.DateTimeFormatOptions;
  /** Intl options for the time part (if separate) */
  timeOptions?: Intl.DateTimeFormatOptions;
  /** If true, format as date+time (toLocaleString); else date only */
  includeTime?: boolean;
  /** className for the wrapper span */
  className?: string;
};

/**
 * Renders a date/time in the viewer's device timezone (device-first).
 * Uses serverFallback on first paint, then device TZ after hydration.
 */
export function FormattedDateTime({
  date,
  serverFallback,
  dateOptions = { weekday: 'short', month: 'short', day: 'numeric' },
  timeOptions = { hour: 'numeric', minute: '2-digit' },
  includeTime = true,
  className,
}: Props) {
  const tz = useViewerTimezone(serverFallback);
  const d = typeof date === 'string' ? new Date(date) : date;

  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz || 'UTC',
    ...(includeTime ? { ...dateOptions, ...timeOptions } : dateOptions),
  };

  const text = includeTime
    ? d.toLocaleString(undefined, opts)
    : d.toLocaleDateString(undefined, opts);

  return <span className={className}>{text}</span>;
}
