'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PartyPopper, Sparkles, User } from 'lucide-react';
import { createGuestUserAction } from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Avatar options (emojis for simplicity)
const AVATAR_OPTIONS = [
  '😎', '🎉', '🔥', '⚡', '🌟', '🎮', '🏁', '🎯',
  '👨', '👩', '🧑', '👦', '👧', '🧒', '👶', '🤠',
  '😺', '🐶', '🦁', '🐯', '🐼', '🐨', '🐸', '🦄'
];

export default function GuestOnboardingPage() {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [partyName, setPartyName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const partyId = searchParams.get('partyId');
  const partyNameParam = searchParams.get('partyName');

  useEffect(() => {
    // Redirect if no party ID
    if (!partyId) {
      router.push('/party/join');
      return;
    }
    
    setPartyName(partyNameParam || 'the Party');
  }, [partyId, partyNameParam, router]);

  const handleJoin = async () => {
    if (!name.trim()) {
      toast({
        title: '❌ Name Required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!partyId) {
      toast({
        title: '❌ Invalid Party',
        description: 'No party ID provided',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await createGuestUserAction(name.trim(), selectedAvatar, partyId);

    if (result.success && result.user) {
      toast({
        title: '🎉 Welcome to the Party!',
        description: `Hi ${result.user.name}! You have ${result.user.walletBalance} coins to start.`,
        duration: 5000,
      });
      router.push('/party/dashboard');
    } else {
      toast({
        title: '❌ Failed to Join',
        description: result.error,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (!partyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-4 border-white/20 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
              className="flex justify-center"
            >
              <PartyPopper className="h-16 w-16 text-purple-600" />
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Welcome to {partyName}! 🎊
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Let's get you set up for the fun!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                What's your name?
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg h-14 border-2 focus:border-purple-600 focus:ring-purple-600"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoin();
                  }
                }}
              />
            </div>

            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                Choose Your Avatar
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`
                      text-4xl p-3 rounded-xl transition-all duration-200
                      hover:scale-110 hover:shadow-lg
                      ${selectedAvatar === avatar 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-xl ring-4 ring-purple-300' 
                        : 'bg-gray-100 hover:bg-gray-200'
                      }
                    `}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleJoin}
              disabled={loading || !name.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    ⚡
                  </motion.div>
                  Joining...
                </>
              ) : (
                <>
                  Let's Party! 🎉
                </>
              )}
            </Button>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 p-4 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-700 text-center">
                <strong>🪙 You'll start with 1,000 coins!</strong>
                <br />
                Use them to bet on races, play games, and win big! 💰
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fun Animation Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -50,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 50,
                rotate: 360
              }}
              transition={{ 
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            >
              {['🎉', '🎊', '🎈', '🎁', '⚡'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
