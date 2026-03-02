import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db/queries/education', () => ({
  getUserById: vi.fn(),
  isStudentInTeacherClass: vi.fn(),
}));

import { canMessage } from './messaging';

const { getUserById, isStudentInTeacherClass } = await import(
  '@/lib/db/queries/education'
);

type User = {
  id: number;
  platformRole: string | null;
  schoolId: string | null;
  name?: string | null;
  email?: string;
};

function makeUser(
  id: number,
  platformRole: string,
  schoolId: string | null = null
): User {
  return {
    id,
    platformRole,
    schoolId,
    name: `User ${id}`,
    email: `user${id}@test.com`,
  };
}

describe('canMessage', () => {
  beforeEach(() => {
    vi.mocked(getUserById).mockReset();
    vi.mocked(isStudentInTeacherClass).mockReset();
  });

  it('returns false for student → student', async () => {
    const student1 = makeUser(1, 'student', 'school-1');
    const student2 = makeUser(2, 'student', 'school-1');
    vi.mocked(getUserById)
      .mockResolvedValueOnce(student1 as any)
      .mockResolvedValueOnce(student2 as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns false for school_admin → teacher', async () => {
    const admin = makeUser(1, 'school_admin', 'school-1');
    const teacher = makeUser(2, 'teacher', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(teacher as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns true for school_admin → student same school', async () => {
    const admin = makeUser(1, 'school_admin', 'school-1');
    const student = makeUser(2, 'student', 'school-1');
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(student as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(true);
  });

  it('returns false for school_admin → student different school', async () => {
    const admin = makeUser(1, 'school_admin', 'school-1');
    const student = makeUser(2, 'student', 'school-2');
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(student as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns false for school_admin → student without schoolId', async () => {
    const admin = makeUser(1, 'school_admin', 'school-1');
    const student = makeUser(2, 'student', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(student as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns false when school_admin has no schoolId', async () => {
    const admin = makeUser(1, 'school_admin', null);
    const student = makeUser(2, 'student', 'school-1');
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(student as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns true for teacher ↔ student when they share a class', async () => {
    const teacher = makeUser(1, 'teacher', null);
    const student = makeUser(2, 'student', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(teacher as any)
      .mockResolvedValueOnce(student as any);
    vi.mocked(isStudentInTeacherClass).mockResolvedValue(true);

    const result = await canMessage(1, 2);
    expect(result).toBe(true);
    expect(isStudentInTeacherClass).toHaveBeenCalledWith(1, 2);
  });

  it('returns false for teacher ↔ student when they do not share a class', async () => {
    const teacher = makeUser(1, 'teacher', null);
    const student = makeUser(2, 'student', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(teacher as any)
      .mockResolvedValueOnce(student as any);
    vi.mocked(isStudentInTeacherClass).mockResolvedValue(false);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns true for student → teacher when they share a class', async () => {
    const student = makeUser(1, 'student', null);
    const teacher = makeUser(2, 'teacher', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(student as any)
      .mockResolvedValueOnce(teacher as any);
    vi.mocked(isStudentInTeacherClass).mockResolvedValue(true);

    const result = await canMessage(1, 2);
    expect(result).toBe(true);
    expect(isStudentInTeacherClass).toHaveBeenCalledWith(2, 1);
  });

  it('returns true for admin → anyone', async () => {
    const admin = makeUser(1, 'admin', null);
    const student = makeUser(2, 'student', null);
    vi.mocked(getUserById)
      .mockResolvedValueOnce(admin as any)
      .mockResolvedValueOnce(student as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(true);
    expect(isStudentInTeacherClass).not.toHaveBeenCalled();
  });

  it('returns false for sender === recipient', async () => {
    const result = await canMessage(1, 1);
    expect(result).toBe(false);
    expect(getUserById).not.toHaveBeenCalled();
  });

  it('returns false when sender not found', async () => {
    vi.mocked(getUserById)
      .mockResolvedValueOnce(null as any)
      .mockResolvedValueOnce(makeUser(2, 'student', null) as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });

  it('returns false when recipient not found', async () => {
    vi.mocked(getUserById)
      .mockResolvedValueOnce(makeUser(1, 'admin', null) as any)
      .mockResolvedValueOnce(null as any);

    const result = await canMessage(1, 2);
    expect(result).toBe(false);
  });
});
