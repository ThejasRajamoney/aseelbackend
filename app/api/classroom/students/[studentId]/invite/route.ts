import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getAuthUserFromSession } from '@/lib/auth';
import { buildStudentInviteLink } from '@/lib/invite';
import { sendStudentInviteEmail } from '@/lib/email';
import { getTeacherStudentById } from '@/lib/student-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getTeacherUser(request: NextRequest) {
  const user = getAuthUserFromSession(request.cookies.get(AUTH_SESSION_COOKIE)?.value);

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return user;
}

export async function POST(request: NextRequest, { params }: { params: { studentId: string } }) {
  const teacher = getTeacherUser(request);

  if (!teacher) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const student = getTeacherStudentById(teacher.id, params.studentId);

  if (!student) {
    return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
  }

  try {
    const inviteUrl = buildStudentInviteLink(new URL(request.url).origin, student);
    const result = await sendStudentInviteEmail({
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      studentName: student.name,
      studentEmail: student.email,
      inviteUrl,
    });

    return NextResponse.json({
      ok: true,
      inviteId: result.id ?? null,
      recipientEmail: result.recipientEmail,
      deliveryMode: result.deliveryMode,
      student,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Email delivery failed.' }, { status: 400 });
  }
}
