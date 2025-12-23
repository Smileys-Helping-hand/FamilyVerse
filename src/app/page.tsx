'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Leaf } from 'lucide-react';

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (userProfile?.familyId) {
          router.replace('/dashboard');
        } else {
          router.replace('/welcome');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, userProfile, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
            <Leaf className="h-16 w-16 text-primary animate-spin" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    </div>
  );
}
