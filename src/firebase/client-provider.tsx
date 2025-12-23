'use client';

import { AuthProvider } from '@/context/AuthContext';
import { initializeFirebase, FirebaseProvider } from '.';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = initializeFirebase();

  if (!app || !auth || !firestore) {
    return null;
  }
  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseProvider>
  );
}