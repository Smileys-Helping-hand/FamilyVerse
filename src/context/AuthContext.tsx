"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { UserProfile, Family } from '@/types';
import { Leaf } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  family: Family | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  family: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUser(user);

      if (!user) {
        setUserProfile(null);
        setFamily(null);
        setLoading(false);
        return;
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);

          if (profile.familyId) {
            const familyDocRef = doc(db, 'families', profile.familyId);
            const unsubscribeFamily = onSnapshot(familyDocRef, (familyDoc) => {
              if (familyDoc.exists()) {
                setFamily({ id: familyDoc.id, ...familyDoc.data() } as Family);
              } else {
                setFamily(null);
              }
              setLoading(false);
            });
            return () => unsubscribeFamily();
          } else {
            setFamily(null);
            setLoading(false);
          }
        } else {
          setUserProfile(null);
          setFamily(null);
          setLoading(false);
        }
      });
      return () => unsubscribeUser();
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading && !user && !userProfile) { // Show loader only on initial app load
    return (
      <div className="flex items-center justify-center h-screen bg-background">
          <div className="flex flex-col items-center space-y-4">
            <Leaf className="h-16 w-16 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading FamilyVerse...</p>
          </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, family, loading }}>
      {!loading || (user && userProfile) ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
