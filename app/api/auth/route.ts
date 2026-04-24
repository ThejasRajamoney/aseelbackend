import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_SESSION_COOKIE,
  authenticateAuthUser,
  clearAuthCookie,
  createAuthSession,
  createAuthUser,
  deleteAuthSession,
  getAuthUserFromSession,
  setAuthCookie,
} from '@/lib/auth';
import type { AuthRole, AuthSessionResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuthMode = 'login' | 'register';

function normalizeMode(value: unknown): AuthMode | null {
  return value === 'login' || value === 'register' ? value : null;
}

function normalizeRole(value: unknown): AuthRole | null {
  return value === 'student' || value === 'teacher' ? value : null;
}

function normalizeBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidate = body as Record<string, unknown>;
  const mode = normalizeMode(candidate.mode);

  if (!mode || typeof candidate.email !== 'string' || typeof candidate.password !== 'string') {
    return null;
  }

  return {
    mode,
    name: typeof candidate.name === 'string' ? candidate.name : '',
    email: candidate.email,
    password: candidate.password,
    role: normalizeRole(candidate.role),
  };
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const user = getAuthUserFromSession(sessionId);

  return NextResponse.json<AuthSessionResponse>({ user });
}

export async function POST(request: NextRequest) {
  const body = normalizeBody(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const user =
      body.mode === 'register'
        ? createAuthUser({
            name: body.name,
            email: body.email,
            password: body.password,
            role: body.role,
          })
        : authenticateAuthUser({
            email: body.email,
            password: body.password,
            role: body.role,
            name: body.name,
          });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const { token } = createAuthSession(user);
    const response = NextResponse.json<AuthSessionResponse>({ user });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication failed.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionId) {
    deleteAuthSession(sessionId);
  }

  const response = NextResponse.json({ user: null });
  clearAuthCookie(response);
  return response;
}
