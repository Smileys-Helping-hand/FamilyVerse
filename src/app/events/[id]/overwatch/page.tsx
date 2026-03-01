'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvent } from '@/app/actions/events';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const OverwatchClient = dynamic(
  () => import('@/components/events/OverwatchClient'),
  { ssr: false, loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-[#00F0FF] font-extrabold text-2xl animate-pulse tracking-widest">⚡ LOADING OVERWATCH</div>
      </div>
  )}
);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

export default function OverwatchPage({ params }: { params: { id: string } }) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [denied, setDenied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user) { loadEvent(); }
  }, [authLoading, user, params.id]);

  const loadEvent = async () => {
    setLoading(true);
    const result = await getEvent(params.id);
    if (!result.success || !result.event) { router.push('/events'); return; }

    // Admin gate: only org admins or the event creator can access Overwatch
    const isAdmin =
      userProfile?.role === 'admin' ||
      user?.email === ADMIN_EMAIL ||
      result.event.creatorId === user?.uid;

    if (!isAdmin) { setDenied(true); setLoading(false); return; }

    setEventData(result);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-[#00F0FF] font-extrabold text-2xl animate-pulse tracking-widest">⚡ INITIALISING</div>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0d0d0d] gap-6 text-center px-6">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-3xl font-extrabold text-white">Access Denied</h1>
        <p className="text-gray-400">Overwatch is restricted to event organisers and admins.</p>
        <Link href={`/events/${params.id}`} className="flex items-center gap-2 text-[#00F0FF] underline">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </Link>
      </div>
    );
  }

  if (!eventData) return null;

  return (
    <OverwatchClient
      event={eventData.event}
      currentUser={{
        uid: user!.uid,
        name: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Admin',
        role: userProfile?.role || 'member',
      }}
    />
  );
}
