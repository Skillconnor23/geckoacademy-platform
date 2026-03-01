'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

type ClassRow = { id: string; name: string; geckoLevel: string | null };

type Props = {
  classes: ClassRow[];
  currentParams: {
    role?: string;
    assignment?: string;
    status?: string;
    search?: string;
    classId?: string;
    geckoLevel?: string;
  };
};

const GECKO_LEVELS = ['G', 'E', 'C', 'K', 'O'] as const;

export function AdminUsersFilters({ classes, currentParams }: Props) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const search = (form.elements.namedItem('search') as HTMLInputElement)?.value?.trim();
    const role = (form.elements.namedItem('role') as HTMLSelectElement)?.value;
    const assignment = (form.elements.namedItem('assignment') as HTMLSelectElement)?.value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement)?.value;
    const classId = (form.elements.namedItem('classId') as HTMLSelectElement)?.value;
    const geckoLevel = (form.elements.namedItem('geckoLevel') as HTMLSelectElement)?.value;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role && role !== 'all') params.set('role', role);
    if (assignment && assignment !== 'all') params.set('assignment', assignment);
    if (status && status !== 'active') params.set('status', status);
    if (classId) params.set('classId', classId);
    if (geckoLevel) params.set('geckoLevel', geckoLevel);

    router.push(`/dashboard/admin/users?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mt-4">
      <div className="flex items-center gap-2">
        <Input
          name="search"
          placeholder="Search by name or email"
          defaultValue={currentParams.search}
          className="w-48"
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Status</label>
        <select
          name="status"
          defaultValue={currentParams.status ?? 'active'}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Role</label>
        <select
          name="role"
          defaultValue={currentParams.role ?? 'all'}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="school_admin">School Admins</option>
        </select>
      </div>

      {(currentParams.role === 'student' || !currentParams.role || currentParams.role === 'all') && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Assignment</label>
          <select
            name="assignment"
            defaultValue={currentParams.assignment ?? 'all'}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Class</label>
        <select
          name="classId"
          defaultValue={currentParams.classId ?? ''}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm min-w-[160px]"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Gecko level</label>
        <select
          name="geckoLevel"
          defaultValue={currentParams.geckoLevel ?? ''}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="">All</option>
          {GECKO_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="sm">
        Apply
      </Button>
    </form>
  );
}
