'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { searchTeachersAction, assignTeacherToClassAction } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Loader2 } from 'lucide-react';

type TeacherRow = { id: number; name: string | null; email: string };

type AssignTeacherSectionProps = {
  classId: string;
  assignedTeacherIds: number[];
};

export function AssignTeacherSection({
  classId,
  assignedTeacherIds,
}: AssignTeacherSectionProps) {
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [assignState, assignAction, isAssignPending] = useActionState<
    { error?: string; success?: boolean },
    FormData
  >(assignTeacherToClassAction, {});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const q = query.trim();
    if (!q) {
      setSearchError('Enter at least 1 character');
      return;
    }
    setSearchPending(true);
    try {
      const result = await searchTeachersAction(q);
      if (result.error) {
        setSearchError(result.error);
        setTeachers([]);
      } else {
        setTeachers(result.teachers ?? []);
      }
    } finally {
      setSearchPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="teacher-search" className="sr-only">
            Search teachers by name or email
          </Label>
          <Input
            id="teacher-search"
            type="text"
            placeholder="Search teachers by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-0"
            maxLength={64}
          />
        </div>
        <Button type="submit" size="sm" disabled={searchPending}>
          {searchPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-1.5">Search</span>
        </Button>
      </form>

      {searchError && (
        <p className="text-sm text-amber-600">{searchError}</p>
      )}

      {teachers.length > 0 && (
        <ul className="space-y-2 border rounded-md divide-y bg-gray-50/50">
          {teachers.map((t) => {
            const alreadyAssigned = assignedTeacherIds.includes(t.id);
            return (
              <li
                key={t.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div>
                  <p className="font-medium text-sm">{t.name ?? t.email}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <form action={assignAction}>
                  <input type="hidden" name="classId" value={classId} />
                  <input type="hidden" name="teacherUserId" value={t.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={alreadyAssigned || isAssignPending}
                  >
                    {alreadyAssigned ? 'Assigned' : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Assign
                      </>
                    )}
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {assignState?.error && (
        <p className="text-sm text-red-500">{assignState.error}</p>
      )}
    </div>
  );
}
