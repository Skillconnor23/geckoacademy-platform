'use client';

import { useActionState } from 'react';
import { updateSchoolAction } from '@/lib/actions/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { School } from '@/lib/db/schema';

type Props = { school: School };

export function SchoolAdminSchoolForm({ school }: Props) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return updateSchoolAction(school.id, formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={school.name}
          required
          className="mt-1"
        />
      </div>
      <Button type="submit">Save changes</Button>
      {state && typeof state === 'object' && 'error' in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
