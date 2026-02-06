import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * Ensure a user profile exists in Firestore.
 * This will create the profile if it doesn't exist.
 */
export async function ensureUserProfile(db: Firestore, user: User, name?: string) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    console.log('Creating missing user profile for:', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: name || user.displayName || user.email?.split('@')[0] || 'User',
      familyId: null,
      familyName: null,
      role: null,
      createdAt: serverTimestamp(),
    });
    console.log('User profile created successfully');
  } else {
    console.log('User profile already exists');
  }
}
