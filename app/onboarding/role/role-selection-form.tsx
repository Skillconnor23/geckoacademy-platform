'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const PLATFORM_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'school_admin', label: 'School Admin' },
  { value: 'admin', label: 'Admin' },
] as const;

type ActionState = { error?: string };

type RoleSelectionFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function RoleSelectionForm({ action }: RoleSelectionFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Role</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <RadioGroup
            name="platformRole"
            required
            className="flex flex-col gap-3"
          >
            {PLATFORM_ROLES.map((role) => (
              <div
                key={role.value}
                className="flex items-center space-x-2 rounded-lg border px-4 py-3 hover:bg-gray-50"
              >
                <RadioGroupItem value={role.value} id={role.value} />
                <Label
                  htmlFor={role.value}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
