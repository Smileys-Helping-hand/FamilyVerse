import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import { AwehChatFAB } from '@/components/party/AwehChatIntegration';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PWAHead } from '@/components/pwa/PWAHead';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://alphatraders.co.za'),
  title: "Mohammed's 26th Birthday! 🎂",
  description: 'Join the Sim Racing, Spy Game, and Betting live!',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Party OS',
  },
  openGraph: {
    title: "Mohammed's 26th Birthday! 🎂",
    description: 'Join the Sim Racing, Spy Game, and Betting live!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mohammed's 26th Birthday! 🎂",
    description: 'Join the Sim Racing, Spy Game, and Betting live!',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4c1d95',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Comic+Neue:wght@400;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <PWAHead />
      </head>
      <body className="font-body antialiased min-h-screen w-full overflow-x-hidden bg-[#1a0b2e] text-white" suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <FirebaseClientProvider>
              <AuthProvider>
                {children}
                <AwehChatFAB />
                <PWAInstallPrompt />
              </AuthProvider>
              <Toaster />
            </FirebaseClientProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
