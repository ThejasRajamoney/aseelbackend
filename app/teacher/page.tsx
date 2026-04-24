import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { getCurrentAuthUser } from '@/lib/auth';
import { getTeacherDashboardData } from '@/lib/student-store';

export const metadata: Metadata = {
  title: 'Teacher Dashboard | Aseel',
  description: 'See class-level original thinking trends and aggregated learning signals.',
};

export const dynamic = 'force-dynamic';

export default async function TeacherPage() {
  const currentUser = getCurrentAuthUser();

  if (!currentUser) {
    redirect('/auth?role=teacher&next=/teacher');
  }

  if (currentUser.role !== 'teacher') {
    redirect('/student');
  }

  const data = await getTeacherDashboardData(currentUser.id);

  return <TeacherDashboard data={data} currentUser={currentUser} />;
}
