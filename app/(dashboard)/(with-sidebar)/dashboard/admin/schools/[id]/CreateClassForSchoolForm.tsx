'use client';

import { useActionState } from 'react';
import { createClassAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ActionState = { error?: string };

type Props = {
  schoolId: string;
};

export function CreateClassForSchoolForm({ schoolId }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createClassAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="schoolId" value={schoolId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <Label htmlFor="create-class-name">Class name</Label>
          <Input
            id="create-class-name"
            name="name"
            required
            placeholder="e.g. English 101"
            disabled={isPending}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="create-class-level">Level (optional)</Label>
          <Input
            id="create-class-level"
            name="level"
            placeholder="e.g. Beginner"
            disabled={isPending}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <Label htmlFor="create-class-timezone">Timezone</Label>
          <Input
            id="create-class-timezone"
            name="timezone"
            placeholder="e.g. Asia/Ulaanbaatar"
            defaultValue="Asia/Ulaanbaatar"
            disabled={isPending}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="create-class-description">Description (optional)</Label>
        <textarea
          id="create-class-description"
          name="description"
          rows={2}
          placeholder="Optional description"
          disabled={isPending}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create class'}
      </Button>
    </form>
  );
}
