import { redirect } from 'next/navigation';
import { getCurrentPartyUserAction } from '@/app/actions/party-logic';
import TaskPadClient from './client';

export const dynamic = 'force-dynamic';

export default async function PartyTasksPage() {
  const user = await getCurrentPartyUserAction();

  if (!user) {
    redirect('/party/join');
  }

  return <TaskPadClient user={user} />;
}
