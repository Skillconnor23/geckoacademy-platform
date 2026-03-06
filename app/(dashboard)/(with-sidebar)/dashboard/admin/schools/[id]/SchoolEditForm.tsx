'use client';

import { useActionState } from 'react';
import { updateSchoolAction } from '@/lib/actions/schools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { School } from '@/lib/db/schema';

type Props = { school: School };

export function SchoolEditForm({ school }: Props) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return updateSchoolAction(school.id, formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>School name</CardTitle>
        <p className="text-sm text-muted-foreground">
          School admins can also edit their school name from their dashboard.
        </p>
      </CardHeader>
      <CardContent>
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
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={school.slug}
              className="mt-1"
            />
          </div>
          <Button type="submit">Save changes</Button>
          {state && 'error' in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
