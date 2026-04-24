import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getAuthUserFromSession } from '@/lib/auth';
import { getTeacherStudents, saveTeacherStudentInvite } from '@/lib/student-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getTeacherUser(request: NextRequest) {
  const user = getAuthUserFromSession(request.cookies.get(AUTH_SESSION_COOKIE)?.value);

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return user;
}

function normalizeBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.email !== 'string') {
    return null;
  }

  return {
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
    email: candidate.email,
  };
}

export async function GET(request: NextRequest) {
  const teacher = getTeacherUser(request);

  if (!teacher) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json({ students: getTeacherStudents(teacher.id) });
}

export async function POST(request: NextRequest) {
  const teacher = getTeacherUser(request);

  if (!teacher) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = normalizeBody(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const student = saveTeacherStudentInvite(teacher.id, {
      studentName: body.name,
      studentEmail: body.email,
    });

    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not add student.' }, { status: 400 });
  }
}
