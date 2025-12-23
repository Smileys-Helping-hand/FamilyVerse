'use client';

import { AuthProvider } from '@/context/AuthContext';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

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
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseProvider>
  );
}
