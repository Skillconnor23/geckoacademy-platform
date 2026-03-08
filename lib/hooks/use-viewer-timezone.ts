'use client';

import { useState, useEffect } from 'react';

/**
 * Device-timezone-first display timezone.
 * Priority: 1) browser/device 2) serverFallback (user.timezone) 3) UTC
 */
export function useViewerTimezone(serverFallback: string): string {
  const [tz, setTz] = useState(() => serverFallback || 'UTC');

  useEffect(() => {
    try {
      const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTz(device || serverFallback || 'UTC');
    } catch {
      setTz(serverFallback || 'UTC');
    }
  }, [serverFallback]);

  return tz || 'UTC';
}
