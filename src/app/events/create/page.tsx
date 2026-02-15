import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreateEventForm from '@/components/events/CreateEventForm';

async function getUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) return null;
  
  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export default async function CreateEventPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <CreateEventForm
      user={{
        uid: user.uid,
        email: user.email || '',
        name: user.name as string || user.email || 'User',
        familyId: user.familyId as string | undefined,
      }}
    />
  );
}
