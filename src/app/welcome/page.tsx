'use client';

import { CreateFamilyForm } from '@/components/family/CreateFamilyForm';
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WelcomePage() {
  const { user, userProfile, loading } = useAuth();
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [checkingFamily, setCheckingFamily] = useState(false);
  const [existingFamilies, setExistingFamilies] = useState<any[]>([]);

  useEffect(() => {
    if (user && db && userProfile && !userProfile.familyId) {
      checkForExistingFamilies();
    }
  }, [user, db, userProfile]);

  const checkForExistingFamilies = async () => {
    if (!user || !db) return;
    
    setCheckingFamily(true);
    try {
      // Check if user created any families
      const familiesQuery = query(
        collection(db, 'families'),
        where('creatorId', '==', user.uid)
      );
      const snapshot = await getDocs(familiesQuery);
      
      if (!snapshot.empty) {
        const families = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExistingFamilies(families);
      }
    } catch (error) {
      console.error('Error checking for families:', error);
    } finally {
      setCheckingFamily(false);
    }
  };

  const handleReconnectFamily = async (familyId: string, familyName: string) => {
    if (!user || !db) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        familyId: familyId,
        familyName: familyName,
        role: 'admin'
      });
      
      toast({
        title: 'Reconnected!',
        description: `Successfully reconnected to ${familyName}`,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg space-y-4">
        {user && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}

        {existingFamilies.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Existing Family Found!</AlertTitle>
            <AlertDescription>
              <p className="mb-3">We found a family you created previously. Would you like to reconnect?</p>
              <div className="space-y-2">
                {existingFamilies.map((family) => (
                  <Button
                    key={family.id}
                    variant="outline"
                    className="w-full"
                    onClick={() => handleReconnectFamily(family.id, family.name)}
                  >
                    Reconnect to "{family.name}"
                  </Button>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Users className="mr-2 h-4 w-4" />
              Create Family
            </TabsTrigger>
            <TabsTrigger value="join">
              <UserPlus className="mr-2 h-4 w-4" />
              Join Family
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Family</CardTitle>
                <CardDescription>
                  Start your family tree by creating a new family space.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateFamilyForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join an Existing Family</CardTitle>
                <CardDescription>
                  Enter a join code to connect with your family's tree.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinFamilyForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

