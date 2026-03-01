'use client';

import { useActionState, useRef } from 'react';
import { updateClassScheduleAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { geckoLevelEnum } from '@/lib/db/schema';

const DAY_OPTIONS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
] as const;

type Props = {
  classId: string;
  geckoLevel: string | null;
  scheduleDays: string[] | null;
  scheduleStartTime: string | null;
  scheduleTimezone: string | null;
  scheduleStartDate: string | Date | null;
  scheduleEndDate: string | Date | null;
  defaultMeetingUrl: string | null;
};

export function WeeklyScheduleCard({
  classId,
  geckoLevel,
  scheduleDays,
  scheduleStartTime,
  scheduleTimezone,
  scheduleStartDate,
  scheduleEndDate,
  defaultMeetingUrl,
}: Props) {
  const [state, formAction, isPending] = useActionState(updateClassScheduleAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = formRef.current ?? e.currentTarget;
    const checked = form.querySelectorAll<HTMLInputElement>('input[name="scheduleDay"]:checked');
    const days = Array.from(checked).map((el) => el.value);
    const hidden = form.querySelector<HTMLInputElement>('input[name="scheduleDays"]');
    if (hidden) hidden.value = JSON.stringify(days);
  }

  const startDateStr =
    scheduleStartDate instanceof Date
      ? scheduleStartDate.toISOString().slice(0, 10)
      : scheduleStartDate
        ? String(scheduleStartDate).slice(0, 10)
        : '';
  const endDateStr =
    scheduleEndDate instanceof Date
      ? scheduleEndDate.toISOString().slice(0, 10)
      : scheduleEndDate
        ? String(scheduleEndDate).slice(0, 10)
        : '';
  const daysArray = Array.isArray(scheduleDays) ? scheduleDays : [];
  const selectedSet = new Set(daysArray.map((d) => d.toLowerCase().slice(0, 3)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Classes repeat on these days. Duration is fixed at 50 minutes.
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="classId" value={classId} />
          <div>
            <Label>Days</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {DAY_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="scheduleDay"
                    value={value}
                    defaultChecked={selectedSet.has(value)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            <input type="hidden" name="scheduleDays" value={JSON.stringify(daysArray)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleStartTime">Start time (HH:mm)</Label>
              <Input
                id="scheduleStartTime"
                name="scheduleStartTime"
                type="time"
                defaultValue={scheduleStartTime ?? '09:00'}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scheduleTimezone">Timezone (IANA)</Label>
              <Input
                id="scheduleTimezone"
                name="scheduleTimezone"
                placeholder="Asia/Ulaanbaatar"
                defaultValue={scheduleTimezone ?? 'Asia/Ulaanbaatar'}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleStartDate">Start date</Label>
              <Input
                id="scheduleStartDate"
                name="scheduleStartDate"
                type="date"
                defaultValue={startDateStr}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scheduleEndDate">End date (optional)</Label>
              <Input
                id="scheduleEndDate"
                name="scheduleEndDate"
                type="date"
                defaultValue={endDateStr}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="geckoLevel">Gecko level</Label>
            <select
              id="geckoLevel"
              name="geckoLevel"
              defaultValue={geckoLevel ?? ''}
              className="mt-1 flex h-9 w-full max-w-[8rem] rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">—</option>
              {geckoLevelEnum.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="defaultMeetingUrl">Default meeting URL</Label>
            <Input
              id="defaultMeetingUrl"
              name="defaultMeetingUrl"
              type="url"
              placeholder="https://meet.example.com/..."
              defaultValue={defaultMeetingUrl ?? ''}
              className="mt-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">Duration: 50 minutes (fixed)</p>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? 'Saving...' : 'Save schedule'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
