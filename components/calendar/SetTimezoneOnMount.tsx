'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setTimezoneAction } from '@/lib/actions/user';

/** Call once on mount to set user timezone from browser if not yet set. */
export function SetTimezoneOnMount() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      setTimezoneAction(tz).then((r) => {
        if (r?.ok) router.refresh();
      });
    }
  }, [router]);
  return null;
}
