/**
 * Parses and validates start/end query params for date-range APIs.
 * Returns parsed dates or an error object for 400 responses.
 */

const MAX_RANGE_DAYS = 93; // ~3 months

export type ParseDateRangeResult =
  | { ok: true; start: Date; end: Date }
  | { ok: false; error: string };

export function parseAndValidateDateRange(
  startStr: string | null,
  endStr: string | null
): ParseDateRangeResult {
  if (startStr == null || startStr.trim() === '') {
    return { ok: false, error: 'Invalid start date' };
  }
  if (endStr == null || endStr.trim() === '') {
    return { ok: false, error: 'Invalid end date' };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (Number.isNaN(start.getTime())) {
    return { ok: false, error: 'Invalid start date' };
  }
  if (Number.isNaN(end.getTime())) {
    return { ok: false, error: 'Invalid end date' };
  }
  if (end < start) {
    return { ok: false, error: 'Invalid date range' };
  }

  const rangeDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  if (rangeDays > MAX_RANGE_DAYS) {
    return { ok: false, error: 'Date range too large' };
  }

  return { ok: true, start, end };
}
