'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { saveAttendanceAction } from '@/lib/actions/attendance';
import type { AttendanceStatus } from '@/lib/db/schema';

type RosterStudent = {
  studentUserId: number;
  studentName: string | null;
  studentEmail: string;
};

type AttendanceRecordRow = {
  id: string;
  studentUserId: number;
  status: AttendanceStatus;
  participationScore: number | null;
  teacherNote: string | null;
};

type SessionOption = {
  id: string;
  startsAt: Date;
};

function initials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
    if (parts.length > 1)
      return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function displayName(name: string | null, email: string): string {
  if (name?.trim()) return name.trim();
  return email;
}

function formatSessionDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

type RowState = {
  status: AttendanceStatus;
  participationScore: number | null;
  teacherNote: string;
};

type Props = {
  classId: string;
  sessionId: string;
  roster: RosterStudent[];
  records: AttendanceRecordRow[];
  sessions: SessionOption[];
};

export function AttendanceForm({
  classId,
  sessionId,
  roster,
  records,
  sessions,
}: Props) {
  const router = useRouter();
  const recordMap = new Map(records.map((r) => [r.studentUserId, r]));

  function getInitialState(studentUserId: number): RowState {
    const rec = recordMap.get(studentUserId);
    return {
      status: rec?.status ?? 'present',
      participationScore: rec?.participationScore ?? null,
      teacherNote: rec?.teacherNote ?? '',
    };
  }

  const [rowStates, setRowStates] = useState<Map<number, RowState>>(() =>
    new Map(roster.map((r) => [r.studentUserId, getInitialState(r.studentUserId)]))
  );

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  function updateRow(studentUserId: number, patch: Partial<RowState>) {
    setRowStates((prev) => {
      const next = new Map(prev);
      const cur = next.get(studentUserId) ?? getInitialState(studentUserId);
      next.set(studentUserId, { ...cur, ...patch });
      return next;
    });
  }

  async function handleSave() {
    setSaveStatus('saving');
    const rows = roster.map((r) => {
      const state = rowStates.get(r.studentUserId) ?? getInitialState(r.studentUserId);
      return {
        studentUserId: r.studentUserId,
        status: state.status,
        participationScore:
          state.participationScore != null &&
          state.participationScore >= 0 &&
          state.participationScore <= 10
            ? state.participationScore
            : undefined,
        teacherNote: state.teacherNote.trim() || undefined,
      };
    });

    const formData = new FormData();
    formData.set('classId', classId);
    formData.set('sessionId', sessionId);
    formData.set('rows', JSON.stringify(rows));

    const result = await saveAttendanceAction(null, formData);
    if (result.success) {
      setSaveStatus('saved');
      router.refresh();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  function handleSessionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id && id !== sessionId) {
      router.push(`/classroom/${classId}/attendance?session=${id}`);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)]">
      <div className="flex-1 pb-24">
        {roster.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">
            No students enrolled. Add students from the People page.
          </p>
        ) : (
          <ul className="space-y-4">
            {roster.map((r) => {
              const state = rowStates.get(r.studentUserId) ?? getInitialState(r.studentUserId);
              return (
                <li
                  key={r.studentUserId}
                  className="rounded-xl border border-[#e5e7eb] bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex items-center gap-3 shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {initials(r.studentName, r.studentEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {displayName(r.studentName, r.studentEmail)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Status: big tap targets */}
                      <div className="flex gap-2 flex-wrap" role="group" aria-label="Attendance status">
                        {STATUSES.map((s) => (
                          <Button
                            key={s}
                            type="button"
                            variant={state.status === s ? 'default' : 'outline'}
                            size="lg"
                            className="min-h-[44px] min-w-[88px] capitalize"
                            onClick={() => updateRow(r.studentUserId, { status: s })}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground whitespace-nowrap">
                            Participation (0–10):
                          </span>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            placeholder="—"
                            className="w-16 h-9"
                            value={
                              state.participationScore != null
                                ? String(state.participationScore)
                                : ''
                            }
                            onChange={(e) => {
                              const v = e.target.value.trim();
                              updateRow(r.studentUserId, {
                                participationScore: v === '' ? null : Math.min(10, Math.max(0, parseInt(v, 10) || 0)),
                              });
                            }}
                          />
                        </label>
                        <div className="flex-1 min-w-0">
                          <label className="sr-only">Note</label>
                          <textarea
                            placeholder="Note (optional)"
                            rows={2}
                            className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={state.teacherNote}
                            onChange={(e) =>
                              updateRow(r.studentUserId, {
                                teacherNote: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e5e7eb] bg-white/95 backdrop-blur-sm p-4 safe-area-pb">
        <div className="mx-auto max-w-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {saveStatus === 'saved' && (
            <p className="text-sm font-medium text-[#7daf41]">Saved</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm font-medium text-destructive">
              Failed to save. Try again.
            </p>
          )}
          <div className="flex gap-2">
            {sessions.length > 1 && (
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={sessionId}
                onChange={handleSessionChange}
                aria-label="Select session"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatSessionDate(s.startsAt)}
                  </option>
                ))}
              </select>
            )}
            <Button
              type="button"
              size="lg"
              className="min-h-[48px] flex-1 sm:flex-initial"
              disabled={saveStatus === 'saving' || roster.length === 0}
              onClick={() => void handleSave()}
            >
              {saveStatus === 'saving' ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
