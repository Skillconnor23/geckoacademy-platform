'use client';

import { useActionState } from 'react';
import { createExceptionSessionAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EduSession } from '@/lib/db/schema';

type OccurrenceOption = { startsAt: Date; label: string };

type Props = {
  classId: string;
  sessions: (EduSession & { kind?: string | null; originalStartsAt?: Date | null })[];
  occurrenceOptions: OccurrenceOption[];
};

export function ExceptionsCard({ classId, sessions, occurrenceOptions }: Props) {
  type State = { error?: string };
  const [extraState, extraAction, extraPending] = useActionState<State, FormData>(createExceptionSessionAction, {} as State);
  const [overrideState, overrideAction, overridePending] = useActionState<State, FormData>(createExceptionSessionAction, {} as State);
  const [cancelState, cancelAction, cancelPending] = useActionState<State, FormData>(createExceptionSessionAction, {} as State);

  const exceptions = sessions.filter((s) => s.kind && ['extra', 'override', 'cancel'].includes(s.kind));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exceptions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Extra sessions, reschedules, and cancellations. Calendar uses schedule + these exceptions.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {exceptions.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground">Current exceptions</Label>
            <ul className="mt-1 text-sm space-y-1">
              {exceptions.map((s) => (
                <li key={s.id}>
                  <span className="font-medium capitalize">{s.kind ?? 'session'}</span>
                  {' — '}
                  {s.kind === 'cancel' && s.originalStartsAt
                    ? new Date(s.originalStartsAt).toLocaleString()
                    : new Date(s.startsAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Add extra session (one-off)</Label>
          <form action={extraAction} className="mt-2 space-y-2">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="kind" value="extra" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Starts</Label>
                <Input name="startsAt" type="datetime-local" required className="mt-0.5" />
              </div>
              <div>
                <Label className="text-xs">Ends</Label>
                <Input name="endsAt" type="datetime-local" required className="mt-0.5" />
              </div>
            </div>
            <Input name="meetingUrl" type="url" placeholder="Meeting URL (optional)" className="max-w-md" />
            <Button type="submit" size="sm" disabled={extraPending}>Add extra</Button>
            {extraState?.error && <p className="text-sm text-red-500">{extraState.error}</p>}
          </form>
        </div>

        {occurrenceOptions.length > 0 && (
          <>
            <div>
              <Label className="text-sm font-medium">Reschedule occurrence</Label>
              <form action={overrideAction} className="mt-2 space-y-2">
                <input type="hidden" name="classId" value={classId} />
                <input type="hidden" name="kind" value="override" />
                <div>
                  <Label className="text-xs">Original occurrence</Label>
                  <select
                    name="originalStartsAt"
                    required
                    className="mt-0.5 flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Select…</option>
                    {occurrenceOptions.map((o) => (
                      <option key={o.startsAt.toISOString()} value={o.startsAt.toISOString()}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">New starts</Label>
                    <Input name="startsAt" type="datetime-local" required className="mt-0.5" />
                  </div>
                  <div>
                    <Label className="text-xs">New ends</Label>
                    <Input name="endsAt" type="datetime-local" required className="mt-0.5" />
                  </div>
                </div>
                <Input name="meetingUrl" type="url" placeholder="Meeting URL (optional)" className="max-w-md" />
                <Button type="submit" size="sm" disabled={overridePending}>Reschedule</Button>
                {overrideState?.error && <p className="text-sm text-red-500">{overrideState.error}</p>}
              </form>
            </div>

            <div>
              <Label className="text-sm font-medium">Cancel occurrence</Label>
              <form action={cancelAction} className="mt-2 space-y-2">
                <input type="hidden" name="classId" value={classId} />
                <input type="hidden" name="kind" value="cancel" />
                <div>
                  <Label className="text-xs">Occurrence to cancel</Label>
                  <select
                    name="originalStartsAt"
                    required
                    className="mt-0.5 flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Select…</option>
                    {occurrenceOptions.map((o) => (
                      <option key={o.startsAt.toISOString()} value={o.startsAt.toISOString()}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="sm" variant="outline" disabled={cancelPending}>Cancel occurrence</Button>
                {cancelState?.error && <p className="text-sm text-red-500">{cancelState.error}</p>}
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
