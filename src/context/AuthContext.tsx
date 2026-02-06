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
    
    console.log('AuthContext: Setting up auth listener');
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: onAuthStateChanged fired, user:', user ? user.uid : 'null');
      setLoading(true);
      setUser(user);

      if (!user) {
        console.log('AuthContext: No user, clearing profile and family');
        setUserProfile(null);
        setFamily(null);
        setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }
      
      try {
        console.log('AuthContext: Fetching user from PostgreSQL:', user.uid);
        // Get or create user in PostgreSQL
        const dbUser = await getOrCreateUserAction(user.uid, user.email || '', user.displayName || undefined);
        console.log('AuthContext: User from DB:', dbUser);
        
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
          console.log('AuthContext: Fetching family:', dbUser.familyId);
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
        console.error('AuthContext: Error fetching user data:', error);
        // If there's a database error and we have a Firebase user session,
        // sign them out to break the loop
        console.log('AuthContext: Signing out user due to database error');
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('AuthContext: Error signing out:', signOutError);
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
