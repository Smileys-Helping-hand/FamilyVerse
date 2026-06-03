import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/AuthContext';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/context/ThemeContext';
import { PWAHead } from '@/components/pwa/PWAHead';
import ClientWidgets from '@/components/ClientWidgets';
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';
import PageTransition from '@/components/ui/PageTransition';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://familyverse.co.za'),
  title: "FamilyVerse | The Ultimate Family Event Planner",
  description: "Plan family events effortlessly. Add your people, pick a place, let AI do the research and delegate tasks automatically.",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FamilyVerse',
  },
  openGraph: {
    title: "FamilyVerse | The Ultimate Family Event Planner",
    description: "Plan family events effortlessly. Add your people, pick a place, let AI do the research and delegate tasks automatically.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FamilyVerse | The Ultimate Family Event Planner",
    description: "Plan family events effortlessly. Add your people, pick a place, let AI do the research and delegate tasks automatically.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
    { media: '(prefers-color-scheme: light)', color: '#0F172A' },
  ],
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
      <body className="font-body antialiased min-h-screen w-full overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <FirebaseClientProvider>
              <AuthProvider>
                <PageTransition>
                  {children}
                </PageTransition>
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
