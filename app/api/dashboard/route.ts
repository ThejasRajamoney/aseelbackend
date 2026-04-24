import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getAuthUserFromSession } from '@/lib/auth';
import { getTeacherDashboardData } from '@/lib/student-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const currentUser = getAuthUserFromSession(request.cookies.get(AUTH_SESSION_COOKIE)?.value);

  if (!currentUser || currentUser.role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json(await getTeacherDashboardData(currentUser.id));
}
