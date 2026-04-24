import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StudentAnalysisPanel } from '@/components/StudentAnalysisPanel';
import { getCurrentAuthUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Student Mode | Aseel',
  description: 'Paste your assignment and get Socratic questions that help you prove your thinking.',
};

export const dynamic = 'force-dynamic';

export default function StudentPage() {
  const currentUser = getCurrentAuthUser();

  if (!currentUser) {
    redirect('/auth?role=student&next=/student');
  }

  if (currentUser.role !== 'student') {
    redirect('/teacher');
  }

  return <StudentAnalysisPanel currentUser={currentUser} />;
}
