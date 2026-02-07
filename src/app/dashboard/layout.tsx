'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 w-full max-w-[100vw] overflow-x-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse delay-500" />
      </div>
      
      <Header />
      <main className="flex-1 container py-4 sm:py-8 px-4 relative z-10 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
