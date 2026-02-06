import { redirect } from 'next/navigation';
import { getCurrentPartyUserAction } from '@/app/actions/party-logic';
import PartyDashboardClient from './client';

export default async function PartyDashboardPage() {
  const user = await getCurrentPartyUserAction();

  if (!user) {
    redirect('/party/join');
  }

  return <PartyDashboardClient user={user} />;
}
