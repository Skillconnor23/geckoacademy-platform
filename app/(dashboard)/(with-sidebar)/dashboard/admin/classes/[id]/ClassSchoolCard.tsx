'use client';

import { useState } from 'react';
import { assignClassToSchoolAction } from '@/lib/actions/schools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { School } from '@/lib/db/schema';

type Props = {
  classId: string;
  currentSchoolId: string | null;
  currentSchoolName: string | null;
  schools: School[];
};

export function ClassSchoolCard({ classId, currentSchoolId, currentSchoolName, schools }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(currentSchoolId ?? 'none');

  async function handleAssign() {
    setLoading(true);
    try {
      await assignClassToSchoolAction(
        classId,
        selectedId === 'none' ? null : selectedId
      );
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>School</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign this class to a school so school admins can manage it. Leave unassigned for platform-managed classes.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <p className="font-medium">{currentSchoolName ?? '— No school —'}</p>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loading}
          className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="none">No school</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={handleAssign} disabled={loading}>
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
