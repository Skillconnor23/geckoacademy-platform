'use server';

import { getUser, updateUserTimezone } from '@/lib/db/queries';

/** Set the user's timezone (e.g. from Intl.DateTimeFormat().resolvedOptions().timeZone). Only updates if currently null. */
export async function setTimezoneAction(timezone: string) {
  const user = await getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };
  const tz = (timezone || '').trim();
  if (!tz) return { ok: false, error: 'Timezone required.' };
  if (user.timezone) return { ok: true }; // already set
  await updateUserTimezone(user.id, tz);
  return { ok: true };
}
