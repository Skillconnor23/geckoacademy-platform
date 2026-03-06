'use server';

import { revalidatePath } from 'next/cache';
import {
  listSchools,
  getSchoolById,
  getSchoolBySlug,
  createSchool,
  updateSchool,
  addSchoolMember,
  removeSchoolMember,
  listSchoolMemberships,
  listClassesForSchool,
} from '@/lib/db/queries/schools';
import { listClasses, updateClass } from '@/lib/db/queries/education';
import { getSchoolAdminCandidates } from '@/lib/db/queries/schools';
import { getUser } from '@/lib/db/queries';
import { can } from '@/lib/auth/permissions';
import { getSchoolIdsForUser, isUserSchoolAdmin } from '@/lib/db/queries/schools';

export async function getSchoolsAction() {
  const user = await getUser();
  if (!user || !can(user, 'classes:read')) return { error: 'Unauthorized' };
  const schools = await listSchools();
  return { schools };
}

export async function getSchoolAction(id: string) {
  const user = await getUser();
  if (!user || !can(user, 'classes:read')) return { error: 'Unauthorized' };
  const school = await getSchoolById(id);
  if (!school) return { error: 'School not found' };
  const [memberships, classes] = await Promise.all([
    listSchoolMemberships(id),
    listClassesForSchool(id),
  ]);
  return { school, memberships, classes };
}

export async function createSchoolAction(formData: FormData) {
  const user = await getUser();
  if (!user || !can(user, 'classes:write')) return { error: 'Unauthorized' };
  const name = formData.get('name') as string | null;
  const slug = formData.get('slug') as string | null;
  if (!name?.trim()) return { error: 'Name is required' };
  const slugValue = (slug?.trim() || name.trim().toLowerCase().replace(/\s+/g, '-')).replace(
    /[^a-z0-9-]/g,
    ''
  );
  if (!slugValue) return { error: 'Slug is required' };

  const existing = await getSchoolBySlug(slugValue);
  if (existing) return { error: 'A school with this slug already exists. Choose a different name or slug.' };

  try {
    const school = await createSchool({ name: name.trim(), slug: slugValue });
    revalidatePath('/dashboard/admin/schools');
    return { success: true, schoolId: school.id };
  } catch (e) {
    return { error: 'Failed to create school. Please try again.' };
  }
}

export async function updateSchoolAction(
  id: string,
  formData: FormData
) {
  const user = await getUser();
  if (!user || !can(user, 'classes:write')) return { error: 'Unauthorized' };
  const isAdmin = user.platformRole === 'admin';
  if (!isAdmin) {
    const allowed = await isUserSchoolAdmin(user.id, id);
    if (!allowed) return { error: 'You can only edit your own school.' };
  }
  const name = formData.get('name') as string | null;
  const slug = formData.get('slug') as string | null;
  if (!name?.trim()) return { error: 'Name is required' };
  const payload: { name: string; slug?: string } = { name: name.trim() };
  if (isAdmin && slug?.trim()) {
    payload.slug = slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  const updated = await updateSchool(id, payload);
  if (!updated) return { error: 'School not found' };
  revalidatePath('/dashboard/admin/schools');
  revalidatePath(`/dashboard/admin/schools/${id}`);
  revalidatePath('/dashboard/school-admin/school');
  return { school: updated };
}

export async function addSchoolAdminAction(schoolId: string, userId: number) {
  const user = await getUser();
  if (!user || !can(user, 'users:write')) return { error: 'Unauthorized' };
  await addSchoolMember(schoolId, userId, 'school_admin');
  revalidatePath(`/dashboard/admin/schools/${schoolId}`);
  return {};
}

export async function removeSchoolAdminAction(schoolId: string, userId: number) {
  const user = await getUser();
  if (!user || !can(user, 'users:write')) return { error: 'Unauthorized' };
  await removeSchoolMember(schoolId, userId);
  revalidatePath(`/dashboard/admin/schools/${schoolId}`);
  return {};
}

export async function assignClassToSchoolAction(classId: string, schoolId: string | null) {
  const user = await getUser();
  if (!user || !can(user, 'classes:write')) return { error: 'Unauthorized' };
  await updateClass(classId, { schoolId });
  revalidatePath('/dashboard/admin/classes');
  revalidatePath(`/dashboard/admin/classes/${classId}`);
  revalidatePath('/dashboard/admin/schools');
  if (schoolId) revalidatePath(`/dashboard/admin/schools/${schoolId}`);
  return {};
}

export async function getClassesForAssignAction() {
  const user = await getUser();
  if (!user || !can(user, 'classes:read')) return { error: 'Unauthorized' };
  const classes = await listClasses();
  return { classes };
}

/** Archive a school. Idempotent (already archived = success). Admin only. */
export async function archiveSchoolAction(schoolId: string) {
  const user = await getUser();
  if (!user || !can(user, 'classes:write')) return { error: 'Unauthorized' };
  if (user.platformRole !== 'admin') return { error: 'Only admins can archive schools' };
  const school = await getSchoolById(schoolId);
  if (!school) return { error: 'School not found' };
  await updateSchool(schoolId, { isArchived: true, archivedAt: new Date() });
  revalidatePath('/dashboard/admin/schools');
  revalidatePath(`/dashboard/admin/schools/${schoolId}`);
  return { success: true };
}

/** Returns only users with platformRole = school_admin (eligible to be assigned to a school). Optional search. */
export async function getSchoolAdminCandidatesAction(search?: string) {
  const user = await getUser();
  if (!user || !can(user, 'users:read')) return { error: 'Unauthorized' };
  const candidates = await getSchoolAdminCandidates({
    search: search?.trim() || undefined,
    limit: 50,
  });
  return { users: candidates };
}
