'use client';

import dynamic from 'next/dynamic';

const AwehChatFAB = dynamic(
  () => import('@/components/party/AwehChatIntegration').then((mod) => mod.AwehChatFAB),
  { ssr: false }
);
const PWAInstallPrompt = dynamic(
  () => import('@/components/pwa/PWAInstallPrompt').then((mod) => mod.PWAInstallPrompt),
  { ssr: false }
);

export default function ClientWidgets() {
  return (
    <>
      <AwehChatFAB />
      <PWAInstallPrompt />
    </>
  );
}
