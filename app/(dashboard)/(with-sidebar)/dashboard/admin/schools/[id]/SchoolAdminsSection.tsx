'use client';

import { useState, useCallback } from 'react';
import { addSchoolAdminAction, removeSchoolAdminAction, getSchoolAdminCandidatesAction } from '@/lib/actions/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Search } from 'lucide-react';

type Membership = {
  membership: { userId: number; schoolId: string; role: string };
  userName: string | null;
  userEmail: string;
  userId: number;
};

type UserOption = { id: number; name: string | null; email: string; currentSchoolName?: string | null };

type Props = {
  schoolId: string;
  memberships: Membership[];
};

export function SchoolAdminsSection({ schoolId, memberships }: Props) {
  const [loading, setLoading] = useState(false);
  const [userIdToAdd, setUserIdToAdd] = useState<string>('');
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<UserOption[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const loadCandidates = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await getSchoolAdminCandidatesAction(searchTerm || undefined);
      const list = res && 'users' in res && Array.isArray(res.users)
        ? res.users.map((u: UserOption) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            currentSchoolName: u.currentSchoolName ?? null,
          }))
        : [];
      setCandidates(list);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (candidates.length === 0 && !loading) loadCandidates(search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setUserIdToAdd('');
    if (value.trim().length >= 1) {
      loadCandidates(value);
    } else {
      setCandidates([]);
    }
  };

  async function handleAdd() {
    const uid = parseInt(userIdToAdd, 10);
    if (!uid) return;
    setLoading(true);
    try {
      await addSchoolAdminAction(schoolId, uid);
      setUserIdToAdd('');
      setSearch('');
      setCandidates([]);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(userId: number) {
    setLoading(true);
    try {
      await removeSchoolAdminAction(schoolId, userId);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const memberIds = new Set(memberships.map((m) => m.userId));
  const available = candidates.filter((u) => !memberIds.has(u.id));

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {memberships.map((m) => (
          <li
            key={m.userId}
            className="flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <span>
              {m.userName ?? m.userEmail}
              {m.userName && (
                <span className="text-muted-foreground text-sm ml-2">{m.userEmail}</span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(m.userId)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      {memberships.length === 0 && (
        <p className="text-sm text-muted-foreground">No school admins assigned yet.</p>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium">Add school admin</p>
        <p className="text-xs text-muted-foreground">
          Only users with the School Admin role appear. Search by name or email.
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              disabled={loading}
              className="pl-8 w-[240px]"
            />
          </div>
          {searchFocused && available.length > 0 && (
            <select
              value={userIdToAdd}
              onChange={(e) => setUserIdToAdd(e.target.value)}
              disabled={loading}
              className="h-9 min-w-[220px] rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Select user to add</option>
              {available.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name ?? u.email}
                  {u.currentSchoolName ? ` (${u.currentSchoolName})` : ''}
                </option>
              ))}
            </select>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!userIdToAdd || loading}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {searchFocused && !loading && search.trim() && available.length === 0 && candidates.length > 0 && (
          <p className="text-xs text-muted-foreground">All matching users are already assigned to this school.</p>
        )}
        {searchFocused && !loading && search.trim() && candidates.length === 0 && (
          <p className="text-xs text-muted-foreground">No school admins match this search.</p>
        )}
      </div>
    </div>
  );
}
