import { redirect } from 'next/navigation';

/**
 * /join redirect
 * PWA start_url points here for quick party entry
 */
export default function JoinPage() {
  redirect('/party/join');
}
