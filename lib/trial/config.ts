/**
 * Trial funnel configuration.
 * Conversational flow: learner type → level → info → time → form → confirmed.
 */

export const TRIAL_FUNNEL_STORAGE_KEY = 'gecko_trial_funnel';

const UTAH_TZ = 'America/Denver';

/** Step 1: Who is learning? — labelKey is relative to funnel.learnerType */
export const LEARNER_TYPE_OPTIONS = [
  { value: 'self', labelKey: 'options.self' },
  { value: 'child', labelKey: 'options.child' },
] as const;

/** Step 2: English level — labelKey is relative to funnel.level. "unknown" routes to level finder. */
export const LEVEL_OPTIONS = [
  { value: 'beginner', labelKey: 'options.beginner' },
  { value: 'intermediate', labelKey: 'options.intermediate' },
  { value: 'advanced', labelKey: 'options.advanced' },
  { value: 'unknown', labelKey: 'options.unknown', routeToLevelCheck: true },
] as const;

export type FunnelLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Trial slots in Utah (America/Denver).
 * Beginner: Fri/Sat 12:00–12:30 AM.
 * Intermediate/Advanced: Fri/Sat 12:30–1:00 AM.
 */
export const TRIAL_SLOTS_UTAH = [
  { id: 'fri-0000', dayOfWeek: 5, startMins: 0, endMins: 30, dayKey: 'friday', levels: ['beginner'] as const },
  { id: 'fri-0030', dayOfWeek: 5, startMins: 30, endMins: 60, dayKey: 'friday', levels: ['intermediate', 'advanced'] as const },
  { id: 'sat-0000', dayOfWeek: 6, startMins: 0, endMins: 30, dayKey: 'saturday', levels: ['beginner'] as const },
  { id: 'sat-0030', dayOfWeek: 6, startMins: 30, endMins: 60, dayKey: 'saturday', levels: ['intermediate', 'advanced'] as const },
] as const;

export type TrialSlotId = (typeof TRIAL_SLOTS_UTAH)[number]['id'];

/** Slots available for each level. Unknown/fallback: show both (beginner + int/adv). */
export function getSlotsForLevel(level: FunnelLevel | string | undefined): (typeof TRIAL_SLOTS_UTAH)[number][] {
  if (level === 'beginner') {
    return TRIAL_SLOTS_UTAH.filter((s) => (s.levels as readonly string[]).includes('beginner'));
  }
  if (level === 'intermediate' || level === 'advanced') {
    return TRIAL_SLOTS_UTAH.filter(
      (s) =>
        (s.levels as readonly string[]).includes('intermediate') ||
        (s.levels as readonly string[]).includes('advanced')
    );
  }
  // unknown or missing: show all slots
  return [...TRIAL_SLOTS_UTAH];
}

/** Get slot by id. */
export function getSlotById(slotId: TrialSlotId) {
  return TRIAL_SLOTS_UTAH.find((s) => s.id === slotId);
}

/**
 * Utah DST: 2nd Sunday March - 1st Sunday November.
 * Returns offset hours (UTC - Utah): 7 for MST, 6 for MDT.
 */
function getUtahOffsetHours(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const yy = y ?? 2025;
  const mm = (m ?? 1) - 1;
  const dd = d ?? 1;
  // 2nd Sunday of March
  let marSecondSun = 1;
  let suns = 0;
  for (let i = 1; i <= 31; i++) {
    if (new Date(yy, 2, i).getDay() === 0) {
      suns++;
      if (suns === 2) {
        marSecondSun = i;
        break;
      }
    }
  }
  // 1st Sunday of November
  let novFirstSun = 1;
  for (let i = 1; i <= 30; i++) {
    if (new Date(yy, 10, i).getDay() === 0) {
      novFirstSun = i;
      break;
    }
  }
  const dstStart = new Date(yy, 2, marSecondSun);
  const dstEnd = new Date(yy, 10, novFirstSun);
  const date = new Date(yy, mm, dd);
  const isDST = date >= dstStart && date < dstEnd;
  return isDST ? 6 : 7; // MDT UTC-6, MST UTC-7
}

/**
 * Create a Date in UTC for a given YYYY-MM-DD at 00:startMins in Utah.
 * Utah 00:30 = 06:30 UTC (MDT) or 07:30 UTC (MST).
 */
function dateAtUtahStart(dateStr: string, startMins: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const offsetHours = getUtahOffsetHours(dateStr);
  const utcHours = offsetHours;
  const utcMins = startMins;
  return new Date(Date.UTC(y ?? 2025, (m ?? 1) - 1, d ?? 1, utcHours, utcMins, 0, 0));
}

/**
 * Get the trial datetime for a specific date and slot (Utah time).
 * dateStr: YYYY-MM-DD.
 */
export function getSlotTimestampForDate(slotId: TrialSlotId, dateStr: string): Date {
  const slot = getSlotById(slotId);
  if (!slot) return new Date();
  return dateAtUtahStart(dateStr, slot.startMins);
}

/**
 * Get next occurrence of slot's day at start time in Utah.
 * Returns UTC Date. Call from client where Intl works correctly.
 */
function getNextSlotDateUtc(dayOfWeek: number, startMins: number): Date {
  const now = new Date();
  const utahStr = now.toLocaleString('en-US', { timeZone: UTAH_TZ });
  const utahDate = new Date(utahStr);
  const currentDay = utahDate.getDay();
  const currentMins = utahDate.getHours() * 60 + utahDate.getMinutes();
  let daysAhead = dayOfWeek - currentDay;
  if (daysAhead < 0) daysAhead += 7;
  if (daysAhead === 0 && currentMins >= startMins) daysAhead = 7;
  utahDate.setDate(utahDate.getDate() + daysAhead);
  utahDate.setHours(0, startMins, 0, 0);
  return utahDate;
}

/** Safe fallback timezone if user's is invalid. */
const FALLBACK_TIMEZONE = 'America/Denver';

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Build trial slot label in user's timezone for a specific date.
 * Call from client only to avoid hydration mismatch.
 * @param dateStr - YYYY-MM-DD; if omitted, uses next occurrence
 */
export function getSlotLabelInTimezone(
  slotId: TrialSlotId,
  userTimezone: string,
  tDay: (key: string) => string,
  locale?: string,
  dateStr?: string
): string {
  const slot = getSlotById(slotId);
  if (!slot) return '';
  const tz = userTimezone && isValidTimezone(userTimezone) ? userTimezone : FALLBACK_TIMEZONE;
  const startDate = dateStr
    ? dateAtUtahStart(dateStr, slot.startMins)
    : getNextSlotDateUtc(slot.dayOfWeek, slot.startMins);
  const endDate = dateStr
    ? dateAtUtahStart(dateStr, slot.endMins)
    : getNextSlotDateUtc(slot.dayOfWeek, slot.endMins);
  const fmt = new Intl.DateTimeFormat(locale ?? undefined, {
    timeZone: tz,
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dayLabel = tDay(slot.dayKey);
  return `${dayLabel} — ${fmt.format(startDate)}–${fmt.format(endDate)}`;
}

/**
 * Get ISO timestamp for the trial slot (next occurrence or specific date).
 */
export function getSlotTimestamp(slotId: TrialSlotId, dateStr?: string): Date {
  if (dateStr) return getSlotTimestampForDate(slotId, dateStr);
  const slot = getSlotById(slotId);
  if (!slot) return new Date();
  return getNextSlotDateUtc(slot.dayOfWeek, slot.startMins);
}

/** Available booking date: YYYY-MM-DD + slotIds for that day. */
export type AvailableDate = {
  date: string;
  dayOfWeek: number;
  slotIds: TrialSlotId[];
};

/** Generate available Friday/Saturday dates for the next month, filtered by level. */
export function getAvailableDatesForNextMonth(level: FunnelLevel | string | undefined): AvailableDate[] {
  const slots = getSlotsForLevel(level);
  const slotIdsByDay = new Map<number, TrialSlotId[]>();
  for (const s of slots) {
    const arr = slotIdsByDay.get(s.dayOfWeek) ?? [];
    arr.push(s.id);
    slotIdsByDay.set(s.dayOfWeek, arr);
  }
  const result: AvailableDate[] = [];
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  while (cursor < end) {
    const dow = cursor.getDay();
    const ids = slotIdsByDay.get(dow);
    if (ids && ids.length > 0) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      result.push({ date: `${y}-${m}-${d}`, dayOfWeek: dow, slotIds: ids });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}
