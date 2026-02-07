'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, LogIn, KeyRound, Shield, ArrowLeft } from 'lucide-react';
import { checkCodeAction, getCurrentPartyUserAction } from '@/app/actions/party-logic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeAudio } from '@/lib/audio-utils';
import { AudioWelcomeScreen, useAudioWelcome } from '@/components/party/AudioWelcomeScreen';

export default function PartyJoinPage() {
  const [code, setCode] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { showWelcome, handleEnter } = useAudioWelcome();

  // Check for QR code parameter
  const qrCode = searchParams.get('code');

  // Check if already logged in
  useEffect(() => {
    const checkExistingUser = async () => {
      const user = await getCurrentPartyUserAction();
      if (user) {
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/party/dashboard');
        }
      } else {
        setChecking(false);
        // Auto-fill from QR code
        if (qrCode) {
          setCode(qrCode);
        }
      }
    };
    checkExistingUser();
  }, [router, qrCode]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleCheckCode = async () => {
    // Initialize audio on first user interaction
    initializeAudio();

    if (!code.trim()) {
      toast({
        title: '❌ Code Required',
        description: 'Please enter a party code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await checkCodeAction(code.trim());

    if (result.success) {
      if (result.type === 'party') {
        // Redirect to guest onboarding
        router.push(`/party/guest-onboarding?partyId=${result.partyId}&partyName=${encodeURIComponent(result.partyName || 'the Party')}`);
      } else if (result.type === 'admin') {
        // Admin logged in, redirect to admin dashboard
        toast({
          title: '🎯 Welcome Back, Boss!',
          description: `Hi ${result.userName}`,
        });
        router.push('/admin/dashboard');
      }
    } else {
      toast({
        title: '❌ Invalid Code',
        description: result.error || 'Code not recognized',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    // Initialize audio
    initializeAudio();

    if (!adminPin.trim()) {
      toast({
        title: '❌ PIN Required',
        description: 'Please enter your admin PIN',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await checkCodeAction(adminPin.trim());

    if (result.success && result.type === 'admin') {
      toast({
        title: '🎯 Admin Access Granted',
        description: `Welcome ${result.userName}`,
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        title: '❌ Invalid Admin PIN',
        description: 'Access denied',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Audio Welcome Screen */}
      <AnimatePresence>
        {showWelcome && <AudioWelcomeScreen onEnter={handleEnter} />}
      </AnimatePresence>

      {/* Main Join Page */}
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        {/* Back to Dashboard Button */}
        <div className="absolute top-4 left-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition backdrop-blur-sm border border-white/20">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </Link>
        </div>

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
              LAN Party Command Center
            </p>
          </div>

          {!showAdminLogin ? (
            /* Guest Join Flow */
            <Card className="border-4 border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <PartyPopper className="w-6 h-6 text-purple-600" />
                  Join the Party!
                </CardTitle>
                <CardDescription className="text-base">
                  Enter the party code to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-lg font-semibold flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-purple-600" />
                    Party Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter code (e.g., 1696)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-2xl h-16 text-center font-bold tracking-widest border-2 focus:border-purple-600 focus:ring-purple-600"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCheckCode();
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Get the code from your host or scan a QR code
                  </p>
                </div>

                <Button
                  onClick={handleCheckCode}
                  disabled={loading || !code.trim()}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
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
                      Checking...
                    </>
                  ) : (
                    <>
                      <PartyPopper className="w-5 h-5 mr-2" />
                      Let's Go! 🚀
                    </>
                  )}
                </Button>

                {/* Host Login Link */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Host Login
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Admin Login Flow */
            <Card className="border-4 border-orange-500/50 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-orange-700">
                  <Shield className="w-6 h-6" />
                  Host Login
                </CardTitle>
                <CardDescription className="text-base text-orange-600">
                  Enter your private admin PIN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminPin" className="text-lg font-semibold flex items-center gap-2 text-orange-700">
                    <KeyRound className="h-5 w-5" />
                    Admin PIN (SECRET)
                  </Label>
                  <Input
                    id="adminPin"
                    type="password"
                    placeholder="Enter your secret PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="text-2xl h-16 text-center font-bold tracking-widest border-2 border-orange-300 focus:border-orange-600 focus:ring-orange-600"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAdminLogin();
                      }
                    }}
                  />
                  <p className="text-sm text-orange-600 text-center font-medium">
                    ⚠️ This is NOT the party join code
                  </p>
                </div>

                <Button
                  onClick={handleAdminLogin}
                  disabled={loading || !adminPin.trim()}
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        🔐
                      </motion.div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Admin Login
                    </>
                  )}
                </Button>

                {/* Back Link */}
                <div className="pt-4 border-t border-orange-200">
                  <button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPin('');
                    }}
                    className="w-full text-sm text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    ← Back to Guest Join
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center text-white/80 text-sm space-y-1">
            <p>🏎️ Sim Racing • 🎭 Imposter Game • 💰 Betting</p>
            <p className="text-xs text-white/60">Powered by Party OS</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
