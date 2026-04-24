import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthPanel } from '@/components/AuthPanel';
import { getCurrentAuthUser } from '@/lib/auth';
import type { AuthRole } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Sign In | Aseel',
  description: 'Create a student or teacher account and sign in to Aseel.',
};

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function readSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeRole(value: string | undefined): AuthRole {
  return value === 'teacher' ? 'teacher' : 'student';
}

function sanitizeMode(value: string | undefined) {
  return value === 'register' ? 'register' : 'login';
}

function sanitizeNextPath(value: string | undefined, role: AuthRole) {
  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return role === 'teacher' ? '/teacher' : '/student';
}

function sanitizeText(value: string | undefined) {
  return value?.trim() ?? '';
}

export default function AuthPage({ searchParams }: { searchParams: SearchParams }) {
  const currentUser = getCurrentAuthUser();
  const role = sanitizeRole(readSingleParam(searchParams.role));
  const mode = sanitizeMode(readSingleParam(searchParams.mode));
  const nextPath = sanitizeNextPath(readSingleParam(searchParams.next), role);
  const defaultEmail = sanitizeText(readSingleParam(searchParams.email));
  const defaultName = sanitizeText(readSingleParam(searchParams.name));

  if (currentUser) {
    redirect(currentUser.role === 'teacher' ? '/teacher' : '/student');
  }

  return (
    <AuthPanel
      defaultMode={mode}
      defaultRole={role}
      nextPath={nextPath}
      defaultEmail={defaultEmail}
      defaultName={defaultName}
    />
  );
}
