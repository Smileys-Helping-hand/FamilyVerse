'use client';

import { initializeFirebase, FirebaseProvider } from '.';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = initializeFirebase();

  if (!app || !auth || !firestore) {
    // This can happen in server-side rendering, return a loader or null.
    return null;
  }
  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
        {children}
    </FirebaseProvider>
  );
}