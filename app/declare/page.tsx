import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DeclarationGenerator } from '@/components/DeclarationGenerator';
import { getCurrentAuthUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'AI Use Declaration | Aseel',
  description: 'Generate a transparent AI use declaration for student submissions.',
};

export const dynamic = 'force-dynamic';

export default function DeclarePage() {
  const currentUser = getCurrentAuthUser();

  if (!currentUser) {
    redirect('/auth?role=student&next=/declare');
  }

  if (currentUser.role !== 'student') {
    redirect('/teacher');
  }

  return <DeclarationGenerator initialStudentName={currentUser.name} />;
}
