'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Users, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { CreateFamilyForm } from '@/components/family/CreateFamilyForm';
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const { user, userProfile, loading } = useAuth();
  const auth = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (userProfile?.familyId) { router.replace('/dashboard'); }
  }, [loading, user, userProfile?.familyId, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (loading || !user || userProfile?.familyId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce-soft">🏡</span>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-10 px-4">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[620px] h-[300px] bg-primary/10 blur-[90px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 blur-[90px] rounded-full" />

      <div className="relative max-w-lg mx-auto space-y-5">

        {/* User info bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-card">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Signed in as</p>
            <p className="font-semibold text-sm mt-0.5">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Setup card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-border bg-card shadow-xl overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shadow-md">
                🏡
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Welcome to FamilyVerse!</h1>
                <p className="text-sm text-foreground/50 mt-0.5">
                  One quick step — create or join a family group to start planning.
                </p>
              </div>
            </div>

            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted border border-border mb-5">
                <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-white font-semibold">
                  <Users className="mr-2 h-4 w-4" /> Create Group
                </TabsTrigger>
                <TabsTrigger value="join" className="data-[state=active]:bg-primary data-[state=active]:text-white font-semibold">
                  <UserPlus className="mr-2 h-4 w-4" /> Join Group
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <CreateFamilyForm />
              </TabsContent>
              <TabsContent value="join">
                <JoinFamilyForm />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Trust nudge */}
        <div className="text-center text-xs text-foreground/35 space-y-1">
          <p>🔒 Your group is private. Only people you invite can join.</p>
          <p>You can change the name and add members anytime after setup.</p>
        </div>
      </div>
    </div>
  );
}
