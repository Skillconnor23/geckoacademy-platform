'use client';

import { useActionState } from 'react';
import { enrollStudentByEmailAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ActionState = { error?: string };

export function AddStudentForm({ classId }: { classId: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    enrollStudentByEmailAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="classId" value={classId} />
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">
            Student email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
            className="mt-0"
          />
        </div>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? 'Adding...' : 'Add student'}
        </Button>
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  );
}
