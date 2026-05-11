'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!userProfile?.familyId) {
        router.push('/welcome');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || !userProfile?.familyId) {
    // AuthProvider shows a loader on initial load.
    // Return null to prevent rendering children during redirects.
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 w-full max-w-[100vw] overflow-x-hidden">
      <Header />
      <main className="flex-1 container py-4 sm:py-8 px-4 relative z-10 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
