'use client';

import { useViewerTimezone } from '@/lib/hooks/use-viewer-timezone';

type Props = {
  serverFallback: string;
  /** Template: "{tz}" will be replaced with the viewer timezone */
  template?: string;
  className?: string;
};

/**
 * Displays the viewer's display timezone (device-first).
 * Useful for "Your timezone: America/Los_Angeles" labels.
 */
export function ViewerTimezoneLabel({
  serverFallback,
  template = 'Your timezone: {tz}',
  className,
}: Props) {
  const tz = useViewerTimezone(serverFallback);
  const text = template.replace('{tz}', tz || 'UTC');
  return <span className={className}>{text}</span>;
}
