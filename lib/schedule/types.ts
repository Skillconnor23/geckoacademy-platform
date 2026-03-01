/** Day of week: sun=0 .. sat=6. */
export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

/** Gecko level: G, E, C, K, O. */
export type GeckoLevel = 'G' | 'E' | 'C' | 'K' | 'O';

/** Recurring class schedule for occurrence generation. */
export type ClassSchedule = {
  id: string;
  name: string;
  geckoLevel: string | null;
  scheduleDays: DayOfWeek[];
  scheduleStartTime: string;
  scheduleTimezone: string;
  scheduleStartDate: Date | string;
  scheduleEndDate?: Date | string | null;
  durationMinutes: number;
  defaultMeetingUrl: string | null;
};

/** A single class occurrence (generated or after exceptions). */
export type Occurrence = {
  startsAt: Date;
  endsAt: Date;
  classId: string;
  className: string;
  geckoLevel: string | null;
  meetingUrl: string | null;
  isOverride: boolean;
};

/** Raw session row from DB, used as exception input. */
export type SessionRow = {
  classId: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string | null;
  kind: string | null;
  originalStartsAt: Date | null;
};
