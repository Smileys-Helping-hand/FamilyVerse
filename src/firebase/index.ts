'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore }from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

export { app, auth, firestore, storage };

export { FirebaseClientProvider } from './client-provider';
export { useAuth } from '../context/AuthContext';
