'use client';

import { useActionState } from 'react';
import { createSessionAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ActionState = { error?: string };

export function AddSessionForm({ classId }: { classId: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createSessionAction,
    {}
  );

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(defaultStart.getHours() + 1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 1);

  const toInputValue = (d: Date) =>
    d.toISOString().slice(0, 16);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startsAt">Starts at</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toInputValue(defaultStart)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends at</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={toInputValue(defaultEnd)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Lesson 1"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="meetingUrl">Meeting URL (optional)</Label>
        <Input
          id="meetingUrl"
          name="meetingUrl"
          type="url"
          placeholder="https://meet.example.com/..."
          className="mt-1"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Adding...' : 'Add session'}
      </Button>
    </form>
  );
}
