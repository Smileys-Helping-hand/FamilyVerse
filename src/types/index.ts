import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  familyId: string | null;
  familyName: string | null;
  role: 'admin' | 'member' | null;
}

export interface Family {
  id: string;
  name:string;
  joinCode: string;
  creatorId: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Timestamp | null;
  deathDate: Timestamp | null;
  photoUrl: string | null;
  parents: string[];
  spouses: string[];
  children: string[];
  addedBy: string;
  createdAt: Timestamp;
}

export interface ActivityLog {
  id: string;
  user: string; // User's name or email
  action: string;
  timestamp: Timestamp;
  details: string;
}
