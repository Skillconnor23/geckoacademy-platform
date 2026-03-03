'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { SchoolAdminClassRow } from '@/lib/db/queries/school-admin-dashboard';

type SortKey = keyof Pick<SchoolAdminClassRow, 'className' | 'studentCount' | 'avgQuizScore30d' | 'attemptRate30d' | 'lastActivityAt'>;

export function SchoolAdminClassTable({ rows }: { rows: SchoolAdminClassRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('className');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va: string | number | Date | null = a[sortKey];
      let vb: string | number | Date | null = b[sortKey];
      if (va === null) return sortDir === 'asc' ? 1 : -1;
      if (vb === null) return sortDir === 'asc' ? -1 : 1;
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (va instanceof Date && vb instanceof Date) {
        const cmp = va.getTime() - vb.getTime();
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (va as number) - (vb as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={() => toggleSort('className')}
              className="font-medium hover:underline text-left"
            >
              Class
            </button>
          </TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort('studentCount')}
              className="font-medium hover:underline text-left"
            >
              Students
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort('avgQuizScore30d')}
              className="font-medium hover:underline text-left"
            >
              Avg score (30d)
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort('attemptRate30d')}
              className="font-medium hover:underline text-left"
            >
              Attempt rate (30d)
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => toggleSort('lastActivityAt')}
              className="font-medium hover:underline text-left"
            >
              Last activity
            </button>
          </TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r) => (
          <TableRow key={r.classId}>
            <TableCell className="font-medium">
              <Link
                href={`/classroom/${r.classId}`}
                className="text-primary hover:underline"
              >
                {r.className}
              </Link>
            </TableCell>
            <TableCell>{r.teacherName ?? '—'}</TableCell>
            <TableCell>{r.studentCount}</TableCell>
            <TableCell>
              {r.avgQuizScore30d != null ? `${r.avgQuizScore30d}%` : '—'}
            </TableCell>
            <TableCell>{r.attemptRate30d}%</TableCell>
            <TableCell className="text-muted-foreground">
              {r.lastActivityAt
                ? new Date(r.lastActivityAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </TableCell>
            <TableCell>
              {r.status === 'on_track' ? (
                <span
                  title="On track"
                  className="inline-flex text-[#7daf41]"
                  aria-label="On track"
                >
                  <CheckCircle className="h-5 w-5" />
                </span>
              ) : (
                <span
                  title="Needs attention: low activity or quiz attempts"
                  className="inline-flex text-amber-500"
                  aria-label="Needs attention: low activity or quiz attempts"
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
