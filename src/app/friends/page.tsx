'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Users, Link2, Plus, Sparkles } from 'lucide-react';
import { syncCrossAppFriendsAction, getFriendsAction } from '@/app/actions/friends';
import { getAuth } from 'firebase/auth'; 

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [externalUrl, setExternalUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const auth = getAuth();
  const user = auth.currentUser; 

  useEffect(() => {
    const fetchFriends = async () => {
      if (user?.uid) {
        const result = await getFriendsAction(user.uid);
        if (result.success && result.friends) {
          setFriends(result.friends);
        }
      }
      setLoading(false);
    };
    
    fetchFriends();
    
    if (!user) {
      setFriends([
        { id: '1', friendName: 'Tanya', status: 'ACTIVE', avatarEmoji: '🌟' },
        { id: '2', friendName: 'Kyle', status: 'ACTIVE', avatarEmoji: '🎮' },
      ]);
      setLoading(false);
    }
  }, [user]);

  const handleSync = async () => {
    if (!externalUrl || !apiKey) {
      toast({ title: 'Error', description: 'Please fill in both fields.', variant: 'destructive' });
      return;
    }
    
    if (!user?.uid) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    setIsSyncing(true);
    const result = await syncCrossAppFriendsAction(user.uid, externalUrl, apiKey);
    
    if (result.success) {
      toast({ title: 'Success! ⚡', description: `Synced ${result.count} friends to your squad.` });
      setIsDialogOpen(false);
      const updated = await getFriendsAction(user.uid);
      if (updated.success && updated.friends) setFriends(updated.friends);
    } else {
      toast({ title: 'Sync Failed', description: result.error, variant: 'destructive' });
    }
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 mobile-safe-container">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500 flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              Your Squad
            </h1>
            <p className="text-muted-foreground mt-2">Manage your friends and link your cross-app contacts.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg h-12 px-6 rounded-full">
                <Link2 className="mr-2 h-5 w-5" />
                Link Cross-App Squad ⚡
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  Sync Squad
                </DialogTitle>
                <p className="text-slate-400 text-sm mt-2">
                  Import your friends from Aweh Chat or another FamilyVerse instance using their API Key.
                </p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-slate-300">App URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://www.awehchat.co.za" 
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 h-12"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="text-slate-300">API Key</Label>
                  <Input 
                    id="apiKey" 
                    placeholder="sk_live_..." 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 h-12"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold"
                >
                  {isSyncing ? 'Syncing...' : 'Start Sync ⚡'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {friends.map((friend, i) => (
              <motion.div
                key={friend.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent border-orange-500/20 hover:border-orange-500/50 transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-rose-500/30">
                      <AvatarFallback className="bg-slate-800 text-2xl">
                        {friend.avatarEmoji || '😎'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-xl">{friend.friendName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm text-slate-400 capitalize">{friend.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {friends.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your squad is empty</h3>
                <p className="text-slate-400 max-w-md mx-auto">Link a cross-app squad or start adding friends to plan amazing events together.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
