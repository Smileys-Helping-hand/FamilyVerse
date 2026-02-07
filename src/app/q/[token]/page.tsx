import { headers, cookies } from 'next/headers';
import { getSmartQrByTokenAction, resolveSmartQrAction } from '@/app/actions/smart-qr';
import { RewardReveal } from '@/components/qr/RewardReveal';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SmartQrResolverPage({ params }: Props) {
  const { token } = await params;
  
  // Get user agent for analytics
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  
  // Get user name from cookie if logged in
  const cookieStore = await cookies();
  const userName = cookieStore.get('partyUserName')?.value || 'Guest';
  const userId = cookieStore.get('party_user_id')?.value || cookieStore.get('partyUserId')?.value;
  
  // Resolve the QR with full game logic
  const result = await resolveSmartQrAction(token.toUpperCase(), userName, userAgent, userId);
  
  // Handle special error states with custom error pages
  if (result.status === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-300 mb-4">Mystery Lost</h1>
          <p className="text-gray-500">This clue doesn't exist or has been removed.</p>
          <p className="text-gray-600 text-sm mt-4">Token: {token.toUpperCase()}</p>
        </div>
      </div>
    );
  }
  
  if (result.status === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6 animate-pulse">⏰</div>
          <h1 className="text-3xl font-bold text-gray-300 mb-4">This Clue Has Expired</h1>
          <p className="text-gray-500">This mystery has already been solved. Better luck next time!</p>
        </div>
      </div>
    );
  }
  
  // Everything else goes to the animated reveal component
  return <RewardReveal result={result} />;
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const qr = await getSmartQrByTokenAction(token);
  
  return {
    title: qr ? `Secret: ${qr.title}` : 'Mystery Clue',
    description: 'You discovered a secret! Scan to reveal...',
    openGraph: {
      title: 'SECRET DISCOVERED!',
      description: 'Someone just found a hidden clue!',
    },
  };
}
