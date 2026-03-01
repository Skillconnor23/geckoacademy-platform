import type { Occurrence, SessionRow } from './types';
import { getLocalDatePartsInTz } from './tz';

type ClassMeta = { name: string; geckoLevel: string | null; defaultMeetingUrl: string | null };

function occurrenceKey(classId: string, startsAt: Date, tz: string): string {
  const parts = getLocalDatePartsInTz(startsAt, tz);
  const dateStr = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  return `${classId}:${dateStr}`;
}

/**
 * Apply session exceptions (cancel, override, extra) to generated occurrences.
 * Pure function given the inputs.
 */
export function applyExceptions(
  occurrences: Occurrence[],
  sessions: SessionRow[],
  tzByClass: Map<string, string>,
  classById: Map<string, ClassMeta>
): Occurrence[] {
  const cancelSet = new Set<string>();
  const overrideMap = new Map<string, { startsAt: Date; endsAt: Date; meetingUrl: string | null }>();
  const extraSessions: SessionRow[] = [];

  for (const s of sessions) {
    const tz = tzByClass.get(s.classId) ?? 'UTC';
    if (s.kind === 'cancel' && s.originalStartsAt) {
      cancelSet.add(occurrenceKey(s.classId, s.originalStartsAt, tz));
    } else if (s.kind === 'override' && s.originalStartsAt) {
      overrideMap.set(occurrenceKey(s.classId, s.originalStartsAt, tz), {
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        meetingUrl: s.meetingUrl ?? null,
      });
    } else if (s.kind === 'extra') {
      extraSessions.push(s);
    } else if (!s.kind && s.startsAt) {
      const key = occurrenceKey(s.classId, s.startsAt, tz);
      overrideMap.set(key, {
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        meetingUrl: s.meetingUrl ?? null,
      });
    }
  }

  const result: Occurrence[] = [];

  for (const o of occurrences) {
    const tz = tzByClass.get(o.classId) ?? 'UTC';
    const key = occurrenceKey(o.classId, o.startsAt, tz);
    if (cancelSet.has(key)) continue;

    const override = overrideMap.get(key);
    if (override) {
      result.push({
        ...o,
        startsAt: override.startsAt,
        endsAt: override.endsAt,
        meetingUrl: override.meetingUrl,
        isOverride: true,
      });
    } else {
      result.push(o);
    }
  }

  for (const s of extraSessions) {
    const cls = classById.get(s.classId);
    if (!cls) continue;
    result.push({
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      classId: s.classId,
      className: cls.name,
      geckoLevel: cls.geckoLevel,
      meetingUrl: s.meetingUrl ?? cls.defaultMeetingUrl,
      isOverride: true,
    });
  }

  result.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return result;
}
