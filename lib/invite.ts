import type { TeacherStudentRow } from '@/lib/types';

export function buildStudentInviteLink(origin: string, student: Pick<TeacherStudentRow, 'email' | 'name'>) {
  const url = new URL('/auth', origin);
  url.searchParams.set('mode', 'register');
  url.searchParams.set('role', 'student');
  url.searchParams.set('next', '/student');
  url.searchParams.set('email', student.email);

  if (student.name.trim()) {
    url.searchParams.set('name', student.name.trim());
  }

  return url.toString();
}
