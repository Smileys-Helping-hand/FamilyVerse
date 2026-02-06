import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { generateJoinCode } from '../utils';
import type { UserProfile } from '@/types';

// Function to create a new family
export async function createFamily(db: Firestore, familyName: string, user: UserProfile) {
  if (!user || !user.uid) {
    console.error('createFamily: Invalid user');
    throw new Error('User not authenticated.');
  }

  // 1. Create a new family document
  const familyRef = await addDoc(collection(db, 'families'), {
    name: familyName,
    creatorId: user.uid,
    createdAt: serverTimestamp(),
    joinCode: generateJoinCode(),
  });

  // 2. Add creator as the first member with 'admin' role
  const creatorMemberRef = doc(db, `families/${familyRef.id}/members`, user.uid);
  
  // 3. Update the user's profile
  const userRef = doc(db, 'users', user.uid);

  const batch = writeBatch(db);
  
  batch.set(creatorMemberRef, {
      name: user.name,
      addedBy: user.uid,
      createdAt: serverTimestamp(),
      role: 'admin',
      // Add other default member fields
      gender: null,
      birthDate: null,
      deathDate: null,
      photoUrl: null,
      parents: [],
      spouses: [],
      children: [],
  });

  batch.update(userRef, {
      familyId: familyRef.id,
      familyName: familyName,
      role: 'admin',
  });
  
  await batch.commit();

  // Add activity log
  await addDoc(collection(db, `families/${familyRef.id}/activityLog`), {
    user: user.name || user.email,
    action: 'created_family',
    details: `Family "${familyName}" was created.`,
    timestamp: serverTimestamp(),
  });

  return { familyId: familyRef.id };
}

// Function to join an existing family
export async function joinFamily(db: Firestore, joinCode: string, user: UserProfile) {
    if (!user?.uid) throw new Error('User not authenticated.');

    // 1. Find family with the join code
    const familiesQuery = query(collection(db, 'families'), where('joinCode', '==', joinCode.toUpperCase()));
    const querySnapshot = await getDocs(familiesQuery);

    if (querySnapshot.empty) {
        throw new Error('Invalid join code. Please check and try again.');
    }

    const familyDoc = querySnapshot.docs[0];
    const familyId = familyDoc.id;
    const familyName = familyDoc.data().name;

    // 2. Add user as a new member with 'member' role
    const newMemberRef = doc(db, `families/${familyId}/members`, user.uid);

    // 3. Update the user's profile
    const userRef = doc(db, 'users', user.uid);
    
    const batch = writeBatch(db);

    batch.set(newMemberRef, {
        name: user.name,
        addedBy: user.uid, // or a system ID
        createdAt: serverTimestamp(),
        role: 'member',
        gender: null,
        birthDate: null,
        deathDate: null,
        photoUrl: null,
        parents: [],
        spouses: [],
        children: [],
    });

    batch.update(userRef, {
        familyId: familyId,
        familyName: familyName,
        role: 'member',
    });

    await batch.commit();

    // Add activity log
    await addDoc(collection(db, `families/${familyId}/activityLog`), {
        user: user.name || user.email,
        action: 'joined_family',
        details: `${user.name || user.email} joined the family.`,
        timestamp: serverTimestamp(),
    });

    return { familyId, familyName };
}
