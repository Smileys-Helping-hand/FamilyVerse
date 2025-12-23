'use client';

import { initializeFirebase } from '.';
import FirebaseProvider from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore, storage } = initializeFirebase();

  if (!app || !auth || !firestore) {
    // This can happen during the initial server render.
    // We'll return null and let the client-side render handle it.
    return null;
  }
  
  return (
    <FirebaseProvider value={{ app, auth, firestore, storage }}>
      {children}
    </FirebaseProvider>
  );
}
