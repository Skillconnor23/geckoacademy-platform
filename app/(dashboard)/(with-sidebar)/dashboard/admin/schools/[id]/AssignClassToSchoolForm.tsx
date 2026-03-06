'use client';

import { useState } from 'react';
import { assignClassToSchoolAction } from '@/lib/actions/schools';
import { Button } from '@/components/ui/button';
import type { EduClass } from '@/lib/db/schema';

type Props = {
  classId: string | null;
  currentSchoolId: string;
  unassign?: boolean;
  unassignedClasses?: EduClass[];
  otherSchoolClasses?: EduClass[];
};

export function AssignClassToSchoolForm({
  classId,
  currentSchoolId,
  unassign,
  unassignedClasses = [],
  otherSchoolClasses = [],
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  async function handleAssign(targetSchoolId: string | null) {
    const cid = classId ?? selectedClassId;
    if (!cid) return;
    setLoading(true);
    try {
      await assignClassToSchoolAction(cid, targetSchoolId);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  if (unassign && classId) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAssign(null)}
        disabled={loading}
      >
        Unassign from school
      </Button>
    );
  }

  const options = [...unassignedClasses, ...otherSchoolClasses];
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All classes are already assigned to a school.
      </p>
    );
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        disabled={loading}
        className="h-9 w-[240px] rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="">Select a class</option>
        {unassignedClasses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} (no school)
          </option>
        ))}
        {otherSchoolClasses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} (other school)
          </option>
        ))}
      </select>
      <Button
        size="sm"
        onClick={() => handleAssign(currentSchoolId)}
        disabled={!selectedClassId || loading}
      >
        Assign to this school
      </Button>
    </div>
  );
}
