'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, LogIn, Upload } from 'lucide-react';
import { joinPartyAction, loginWithPinAction, getCurrentPartyUserAction } from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { initializeAudio } from '@/lib/audio-utils';
import { AudioWelcomeScreen, useAudioWelcome } from '@/components/party/AudioWelcomeScreen';

export default function PartyJoinPage() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { showWelcome, handleEnter } = useAudioWelcome();

  // Check for QR code parameter
  const partyCode = searchParams.get('code');
  const quickJoin = partyCode !== null;

  // Check if already logged in
  useEffect(() => {
    const checkExistingUser = async () => {
      const user = await getCurrentPartyUserAction();
      if (user) {
        router.push('/party/dashboard');
      } else {
        setChecking(false);
      }
    };
    checkExistingUser();
  }, [router]);

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleJoin = async () => {
    // Initialize audio on first user interaction
    initializeAudio();

    if (!name.trim()) {
      toast({
        title: '❌ Name Required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await joinPartyAction(name.trim(), partyCode || undefined);

    if (result.success && result.user) {
      if (result.status === 'pending') {
        toast({
          title: '⏳ Awaiting Approval',
          description: `Your PIN: ${result.pinCode} - Host will approve you shortly`,
          duration: 10000,
        });
      } else {
        toast({
          title: '🎉 Welcome to the Party!',
          description: `Your PIN: ${result.pinCode}`,
        });
      }
      router.push('/party/dashboard');
    } else {
      toast({
        title: '❌ Join Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleLogin = async () => {
    // Initialize audio on first user interaction
    initializeAudio();
    
    const pinNumber = parseInt(pin);
    
    if (isNaN(pinNumber) || pin.length !== 4) {
      toast({
        title: '❌ Invalid PIN',
        description: 'PIN must be 4 digits',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await loginWithPinAction(pinNumber);

    if (result.success && result.user) {
      toast({
        title: '✅ Welcome Back!',
        description: `Hi ${result.user.name}`,
      });
      router.push('/party/dashboard');
    } else {
      toast({
        title: '❌ Login Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <>
      {/* Audio Welcome Screen */}
      <AnimatePresence>
        {showWelcome && <AudioWelcomeScreen onEnter={handleEnter} />}
      </AnimatePresence>

      {/* Main Join Page */}
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-8xl mb-4"
          >
            🎮
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Party OS
          </h1>
          <p className="text-white/90 text-lg">
            {partyCode ? `Welcome to ${partyCode}!` : 'LAN Party Command Center'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5" />
              {quickJoin ? 'Quick Join' : 'Join the Party!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quickJoin ? (
              // Quick Join Flow (from QR code)
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quickname">Your Name</Label>
                  <Input
                    id="quickname"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="avatar">Profile Photo (Optional)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <label htmlFor="avatarInput" className="cursor-pointer">
                      <Button variant="outline" type="button" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                      <input
                        id="avatarInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Take a selfie to appear on the leaderboard!
                  </p>
                </div>

                <Button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <PartyPopper className="w-5 h-5 mr-2" />
                  {loading ? 'Joining...' : "Let's Go! 🚀"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You'll receive a 4-digit PIN to rejoin later
                </p>
              </div>
            ) : (
              // Normal Flow (with tabs)
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="join">New Guest</TabsTrigger>
                  <TabsTrigger value="login">Returning</TabsTrigger>
                </TabsList>

                <TabsContent value="join" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                    />
                  </div>

                  <Button
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <PartyPopper className="w-4 h-4 mr-2" />
                    {loading ? 'Joining...' : 'Join Party'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You'll receive a 4-digit PIN to log back in later
                  </p>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <div>
                    <Label htmlFor="pin">4-Digit PIN</Label>
                    <Input
                      id="pin"
                      type="number"
                      placeholder="1234"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.slice(0, 4))}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Lost your PIN? Ask the host to look it up.
                  </p>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-white/80 text-sm">
          <p>🏎️ Sim Racing • 🎭 Imposter Game • 💰 Betting</p>
        </div>
      </motion.div>
    </div>
    </>
  );
}
