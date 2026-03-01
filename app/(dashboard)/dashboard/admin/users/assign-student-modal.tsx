'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assignStudentToClassAction } from '@/lib/actions/education';

type ClassRow = {
  id: string;
  name: string;
  geckoLevel: string | null;
  scheduleDays: unknown;
  scheduleStartTime: string | null;
  scheduleTimezone: string | null;
};

const DAY_DISPLAY: Record<string, string> = {
  sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat',
};

function formatScheduleSummary(c: ClassRow): string {
  const days = Array.isArray(c.scheduleDays)
    ? (c.scheduleDays as (string | number)[]).map((d) =>
        typeof d === 'string'
          ? DAY_DISPLAY[d.toLowerCase().slice(0, 3)] ?? d
          : DAY_DISPLAY['sun']
      ).filter(Boolean)
    : [];
  const time = c.scheduleStartTime ?? '—';
  const level = c.geckoLevel ?? '';
  const parts = [
    days.length ? days.join(' & ') : null,
    time,
    level,
  ].filter(Boolean);
  return parts.join(' · ') || '—';
}

type Props = {
  studentIds: number[];
  studentNames: string;
  classes: ClassRow[];
  onClose: () => void;
  onSuccess: () => void;
};

export function AssignStudentModal({
  studentIds,
  studentNames,
  classes,
  onClose,
  onSuccess,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.geckoLevel?.toLowerCase().includes(term) ?? false)
    );
  }, [classes, search]);

  async function handleAssign() {
    if (!selectedClassId) return;
    setLoading(true);
    setError(null);
    for (const studentId of studentIds) {
      const formData = new FormData();
      formData.set('studentUserId', String(studentId));
      formData.set('classId', selectedClassId);
      const result = await assignStudentToClassAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
    >
      <div
        className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="assign-modal-title" className="text-lg font-semibold mb-2">
          Assign {studentIds.length > 1 ? `${studentIds.length} students` : studentNames} to class
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a class to assign this student to.
        </p>

        <Input
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="max-h-64 overflow-y-auto border rounded-md mb-4">
          {filteredClasses.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No classes found.</p>
          ) : (
            <ul className="divide-y">
              {filteredClasses.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(c.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      selectedClassId === c.id ? 'bg-muted' : ''
                    }`}
                  >
                    <span className="font-medium">{c.name}</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatScheduleSummary(c)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedClassId || loading}
          >
            {loading ? 'Assigning...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
