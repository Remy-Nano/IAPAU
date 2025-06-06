import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import StudentDashboard from '@/components/student/StudentDashboard';
import { redirect } from 'next/navigation';

// Protection côté serveur
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'etudiant') {
    redirect('/auth/login');
  }

  return NextResponse.next();
}

// Page principale
export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'etudiant') {
    redirect('/auth/login');
  }

  return <StudentDashboard />;
}
