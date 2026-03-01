'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Label } from '@/components/ui/label';

type Props = {
  classes: { id: string; name: string }[];
  currentClassId: string | null;
  currentDays: number;
};

export function CalendarFilterForm({
  classes,
  currentClassId,
  currentDays,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (classId: string | null, days: number) => {
      const p = new URLSearchParams(searchParams.toString());
      if (classId && classId !== 'all') p.set('classId', classId);
      else p.delete('classId');
      p.set('days', String(days));
      router.push(`?${p.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <div className="space-y-1">
        <Label className="text-xs">Class</Label>
        <select
          value={currentClassId ?? 'all'}
          onChange={(e) => update(e.target.value === 'all' ? null : e.target.value, currentDays)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Days</Label>
        <select
          value={currentDays}
          onChange={(e) => update(currentClassId, parseInt(e.target.value, 10))}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>
    </div>
  );
}
