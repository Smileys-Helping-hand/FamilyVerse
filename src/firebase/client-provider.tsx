'use client';

import { AuthProvider } from '@/context/AuthContext';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The AuthProvider now handles the Firebase initialization and provides it
  // to the rest of the application. We are keeping this component for
  // structural consistency, in case we need to add more client-side providers.
  return <AuthProvider>{children}</AuthProvider>;
}
