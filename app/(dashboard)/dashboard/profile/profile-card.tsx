'use client';

import { useActionState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { updateMyProfileAction } from '@/lib/actions/profile';

function initials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

type Props = {
  user: { id: number; name: string | null; email: string };
  roleLabel: string;
};

export function ProfileCard({ user, roleLabel }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => updateMyProfileAction(_prev, formData),
    null
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {roleLabel}
            </span>
            <Button variant="outline" size="sm" disabled>
              Change photo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name ?? ''}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
