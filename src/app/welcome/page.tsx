'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Users, UserPlus, LogOut, Zap, Loader2 } from 'lucide-react';

import { CreateFamilyForm } from '@/components/family/CreateFamilyForm';
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAuth as useFirebaseAuth } from '@/firebase';

export default function WelcomePage() {
  const { user, userProfile, loading } = useAuth();
  const auth = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (userProfile?.familyId) {
      router.replace('/dashboard');
    }
  }, [loading, user, userProfile?.familyId, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (loading || !user || userProfile?.familyId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF66]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden py-10 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[620px] h-[300px] bg-[#00FF66]/5 blur-[90px] rounded-full" />

      <div className="relative max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/80">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-600">Signed in as</p>
            <p className="font-medium text-zinc-200 text-sm mt-0.5">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-sm text-zinc-100 shadow-xl">
          <CardHeader className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF66] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.45)]">
              <Zap className="h-5 w-5 text-zinc-950" fill="currentColor" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Set up your squad</CardTitle>
              <CardDescription className="text-zinc-500 pt-1">
                One quick setup and you can start planning outings with the AI Omnibar.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border border-zinc-700">
                <TabsTrigger value="create" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-[#00FF66]">
                  <Users className="mr-2 h-4 w-4" />
                  Create Squad
                </TabsTrigger>
                <TabsTrigger value="join" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-[#00FF66]">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Squad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-5">
                <CreateFamilyForm />
              </TabsContent>

              <TabsContent value="join" className="mt-5">
                <JoinFamilyForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
