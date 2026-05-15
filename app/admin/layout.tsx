import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (session !== 'true') {
    redirect('/auth/login');
  }

  return (
    <Suspense fallback={null}>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </Suspense>
  );
}
