'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CreateEventForm from '@/components/events/CreateEventForm';

export default function CreateEventPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CreateEventForm
      user={{
        uid: user.uid,
        email: user.email || '',
        name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
        familyId: userProfile?.familyId || undefined,
      }}
    />
  );
}
