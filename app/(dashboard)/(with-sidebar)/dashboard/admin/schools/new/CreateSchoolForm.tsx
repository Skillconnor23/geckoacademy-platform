'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createSchoolAction } from '@/lib/actions/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type State = { error?: string; success?: boolean; schoolId?: string } | null;

export function CreateSchoolForm() {
  const router = useRouter();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_: State, formData: FormData) => createSchoolAction(formData),
    null
  );

  useEffect(() => {
    if (state && typeof state === 'object' && 'success' in state && state.success && state.schoolId) {
      const path = `/dashboard/admin/schools/${state.schoolId}`;
      router.push(locale ? `/${locale}${path}` : path);
    }
  }, [state, router, locale]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Lincoln Elementary"
          required
          disabled={isPending}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="e.g. lincoln-elementary"
          disabled={isPending}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create school'}
      </Button>
      {state && typeof state === 'object' && 'error' in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
