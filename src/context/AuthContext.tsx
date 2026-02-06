"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import type { UserProfile, Family } from '@/types';
import { Leaf } from 'lucide-react';
import { getOrCreateUserAction, getFamilyByIdAction } from '@/app/actions/users';

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
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);

      if (!user) {
        setUserProfile(null);
        setFamily(null);
        setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }
      
      try {
        // Get or create user in PostgreSQL
        const dbUser = await getOrCreateUserAction(user.uid, user.email || '', user.displayName || undefined);
        
        // Convert to UserProfile type
        const profile: UserProfile = {
          uid: dbUser.uid,
          email: dbUser.email,
          name: dbUser.name,
          familyId: dbUser.familyId,
          familyName: dbUser.familyName,
          role: dbUser.role as 'admin' | 'member' | null,
        };
        
        setUserProfile(profile);

        // If user has a family, fetch family data
        if (dbUser.familyId) {
          const familyData = await getFamilyByIdAction(dbUser.familyId);
          if (familyData) {
            setFamily({
              id: familyData.id,
              name: familyData.name,
              joinCode: familyData.joinCode,
              creatorId: familyData.creatorId,
            });
          } else {
            setFamily(null);
          }
        } else {
          setFamily(null);
        }
        
        setLoading(false);
        if (initialLoad) setInitialLoad(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If there's a database error, sign them out
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        setUserProfile(null);
        setFamily(null);
        setLoading(false);
        if (initialLoad) setInitialLoad(false);
      }
    });

    return () => unsubscribeAuth();
  }, [initialLoad, auth]);

  if (initialLoad) {
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
