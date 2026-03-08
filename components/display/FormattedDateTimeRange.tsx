'use client';

import { useViewerTimezone } from '@/lib/hooks/use-viewer-timezone';

type Props = {
  start: string | Date;
  end: string | Date;
  serverFallback: string;
  /** e.g. { weekday: 'short', month: 'short', day: 'numeric' } */
  dateOptions?: Intl.DateTimeFormatOptions;
  /** e.g. { hour: 'numeric', minute: '2-digit' } */
  timeOptions?: Intl.DateTimeFormatOptions;
  className?: string;
};

/**
 * Renders "Sat, Mar 8, 2:00 PM – 3:00 PM" in viewer's device timezone.
 */
export function FormattedDateTimeRange({
  start,
  end,
  serverFallback,
  dateOptions = { weekday: 'short', month: 'short', day: 'numeric' },
  timeOptions = { hour: 'numeric', minute: '2-digit' },
  className,
}: Props) {
  const tz = useViewerTimezone(serverFallback);
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;

  const opts = { timeZone: tz || 'UTC', ...dateOptions, ...timeOptions };
  const timeOpts = { timeZone: tz || 'UTC', ...timeOptions };

  const startStr = s.toLocaleString(undefined, opts);
  const endStr = e.toLocaleTimeString(undefined, timeOpts);

  return (
    <span className={className}>
      {startStr} – {endStr}
    </span>
  );
}
