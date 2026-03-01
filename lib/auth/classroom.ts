import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import {
  teacherAssignedToClass,
  studentEnrolledInClass,
  getClassById,
} from '@/lib/db/queries/education';
import { can as canPermission } from '@/lib/auth/permissions';
import type { PlatformRole } from '@/lib/db/schema';

export type UserWithId = { id: number; platformRole: string | null };

/**
 * Returns whether the user can view this classroom (teacher assigned, student enrolled, or admin/school_admin).
 */
export async function canAccessClassroom(
  user: UserWithId | null,
  classId: string
): Promise<boolean> {
  if (!user) return false;
  const role = user.platformRole as PlatformRole | null;
  if (!role) return false;

  if (role === 'admin' || role === 'school_admin') {
    return canPermission(user, 'classes:read');
  }
  if (role === 'teacher') {
    return teacherAssignedToClass(user.id, classId);
  }
  if (role === 'student') {
    return studentEnrolledInClass(user.id, classId);
  }
  return false;
}

/**
 * Returns whether the user can create posts in this classroom (teacher assigned or admin/school_admin).
 */
export async function canPostToClassroom(
  user: UserWithId | null,
  classId: string
): Promise<boolean> {
  if (!user) return false;
  const role = user.platformRole as PlatformRole | null;
  if (!role) return false;

  if (role === 'admin' || role === 'school_admin') {
    return canPermission(user, 'classes:write');
  }
  if (role === 'teacher') {
    return teacherAssignedToClass(user.id, classId);
  }
  return false;
}

/**
 * Ensures user is logged in and can access the classroom. Redirects to /dashboard if not.
 */
export async function requireClassroomAccess(classId: string) {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }
  const eduClass = await getClassById(classId);
  if (!eduClass) {
    redirect('/dashboard');
  }
  const allowed = await canAccessClassroom(user, classId);
  if (!allowed) {
    redirect('/dashboard');
  }
  return { user, eduClass };
}
