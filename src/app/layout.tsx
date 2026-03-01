import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import NotificationBell from "@/components/ui/NotificationBell";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import { PWAHead } from '@/components/pwa/PWAHead';
import ClientWidgets from '@/components/ClientWidgets';
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://alphatraders.co.za'),
  title: "Gang Gear | The Ultimate Squad OS",
  description: "Coordinate outings, track the crew, split the bill, and dominate the games.",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gang Gear',
  },
  openGraph: {
    title: "Gang Gear | The Ultimate Squad OS",
    description: "Coordinate outings, track the crew, split the bill, and dominate the games.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gang Gear | The Ultimate Squad OS",
    description: "Coordinate outings, track the crew, split the bill, and dominate the games.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00FF66',
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
                <div className="flex items-center justify-between px-6 py-4 bg-[#1A1A1A] border-b border-cyan-400">
                  <div className="text-2xl font-extrabold text-[#00FF66]">Gang Gear</div>
                  <NotificationBell />
                </div>
                {children}
                <ClientWidgets />
                <IOSInstallBanner />
              </AuthProvider>
              <Toaster />
            </FirebaseClientProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
