'use client';

import { useActionState } from 'react';
import { joinClassByCodeAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ActionState = { error?: string };

export function JoinClassForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    joinClassByCodeAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="code">Class code</Label>
        <Input
          id="code"
          name="code"
          type="text"
          required
          placeholder="e.g. ABC123"
          className="mt-1 font-mono uppercase"
          autoComplete="off"
          maxLength={12}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Joining...' : 'Join class'}
      </Button>
    </form>
  );
}
