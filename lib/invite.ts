import type { TeacherStudentRow } from '@/lib/types';

function normalizeOrigin(origin: string) {
  const trimmed = origin.trim().replace(/\/+$/, '');

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function resolveAppOrigin(fallbackOrigin?: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  if (fallbackOrigin) {
    return normalizeOrigin(fallbackOrigin);
  }

  return 'http://localhost:3001';
}

export function buildStudentInviteLink(origin: string, student: Pick<TeacherStudentRow, 'email' | 'name'>) {
  const url = new URL('/auth', normalizeOrigin(origin));
  url.searchParams.set('mode', 'register');
  url.searchParams.set('role', 'student');
  url.searchParams.set('next', '/student');
  url.searchParams.set('email', student.email);

  if (student.name.trim()) {
    url.searchParams.set('name', student.name.trim());
  }

  return url.toString();
}
