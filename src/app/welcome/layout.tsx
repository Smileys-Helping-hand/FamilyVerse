'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomeLayout({
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
      } else if (userProfile?.familyId) {
        router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || userProfile?.familyId) {
    return null;
  }

  return <div className="min-h-screen">{children}</div>;
}
