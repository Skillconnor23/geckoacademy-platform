'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import {
  assignTeacherToClassAction,
  removeTeacherFromClassAction,
} from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, X } from 'lucide-react';

type ClassOption = { id: string; name: string; geckoLevel: string | null };

type AssignProps = {
  teacherId: number;
  assignedClassIds: string[];
  classesAvailableToAssign: ClassOption[];
};

type RemoveProps = {
  teacherId: number;
  removeClassId: string;
  removeClassName: string;
};

type Props =
  | (AssignProps & { removeOnly?: false; removeClassId?: never; removeClassName?: never })
  | (RemoveProps & { removeOnly: true; assignedClassIds?: never; classesAvailableToAssign?: never });

export function TeacherDetailActions(props: Props) {
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const [assignState, assignAction, isAssignPending] = useActionState<
    { error?: string; success?: boolean },
    FormData
  >(assignTeacherToClassAction, {});

  const [removeState, removeAction, isRemovePending] = useActionState<
    { error?: string; success?: boolean },
    FormData
  >(removeTeacherFromClassAction, {});


  useEffect(() => {
    if (removeState?.success) {
      setRemoveOpen(false);
      router.refresh();
    }
  }, [removeState?.success, router]);

  if (props.removeOnly) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setRemoveOpen(true)}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Remove
        </Button>
        {removeOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => !isRemovePending && setRemoveOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-2">
                Remove from class?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to remove this teacher from{' '}
                <strong>{props.removeClassName}</strong>? They will no longer
                have access to the class. Historical records will be preserved.
              </p>
              {removeState?.error && (
                <p className="text-sm text-destructive mb-4">
                  {removeState.error}
                </p>
              )}
              <form
                action={removeAction}
                className="flex justify-end gap-2"
              >
                <input type="hidden" name="classId" value={props.removeClassId} />
                <input
                  type="hidden"
                  name="teacherUserId"
                  value={props.teacherId}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRemoveOpen(false)}
                  disabled={isRemovePending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isRemovePending}
                >
                  {isRemovePending ? 'Removing...' : 'Yes, remove'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  const { classesAvailableToAssign } = props;
  const canAssign = classesAvailableToAssign.length > 0;

  return (
    <>
      <Button
        size="sm"
        onClick={() => setAssignOpen(true)}
        disabled={!canAssign}
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        Assign to class
      </Button>
      {assignOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isAssignPending && setAssignOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Assign to class</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select a class to assign this teacher to. Only active,
              non-archived classes are shown.
            </p>
            {assignState?.error && (
              <p className="text-sm text-destructive mb-4">{assignState.error}</p>
            )}
            <form action={assignAction} className="space-y-4">
              <div>
                <Label htmlFor="assign-class-select" className="sr-only">
                  Choose a class
                </Label>
                <select
                  id="assign-class-select"
                  name="classId"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Choose a class</option>
                  {classesAvailableToAssign.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.geckoLevel ? ` (${c.geckoLevel})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <input type="hidden" name="teacherUserId" value={props.teacherId} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignOpen(false)}
                  disabled={isAssignPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedClassId || isAssignPending}
                >
                  {isAssignPending ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
