'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Shield, Users, Key, PartyPopper, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { initializeSystemAction, checkSystemStatusAction } from './actions';

export default function GenesisSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [systemExists, setSystemExists] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields - simplified! No PIN needed
  const [partyJoinCode, setPartyJoinCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [partyName, setPartyName] = useState('');

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    const result = await checkSystemStatusAction();
    setSystemExists(result.partyExists);
    setLoading(false);
  };

  const handleInitialize = async () => {
    if (systemExists && !confirmReset) {
      alert('Please confirm you want to reset the system');
      return;
    }

    setInitializing(true);

    const result = await initializeSystemAction({
      adminPin: '', // Not used - auto-generated
      partyJoinCode: partyJoinCode || '', // Optional - auto-generated if empty
      hostName,
      partyName,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } else {
      alert(`Error: ${result.error}`);
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-16 w-16 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="inline-block"
          >
            <Check className="h-24 w-24 text-green-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white">Party Created!</h1>
          <p className="text-green-300 text-xl">Redirecting to Admin Dashboard...</p>
          <div className="text-gray-400 text-sm space-y-1">
            <p>Party: <span className="font-mono text-white">{partyName}</span></p>
            {partyJoinCode && <p>Join Code: <span className="font-mono text-white">{partyJoinCode}</span></p>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50">
              <Rocket className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            GENESIS PROTOCOL
          </h1>
          <p className="text-purple-200 text-lg">
            Initialize Party OS - First Time Setup
          </p>
        </motion.div>

        {/* Warning if system exists */}
        {systemExists && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-orange-500/20 border-orange-500/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-orange-400 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-orange-300">System Already Initialized</h3>
                    <p className="text-orange-200 text-sm">
                      A party already exists. Running this will reset the system and all game data.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Checkbox
                        id="confirm"
                        checked={confirmReset}
                        onCheckedChange={(checked) => setConfirmReset(checked === true)}
                        className="border-orange-400"
                      />
                      <Label htmlFor="confirm" className="text-orange-200 cursor-pointer">
                        I understand and want to reset the system
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Setup Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Shield className="h-6 w-6 text-purple-400" />
                Create Your Party
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter your name and party details - you'll be logged in automatically!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Host Name - First! */}
              <div className="space-y-2">
                <Label htmlFor="hostName" className="text-white flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-pink-400" />
                  Your Name
                </Label>
                <Input
                  id="hostName"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-slate-800/50 border-pink-500/30 text-white text-lg"
                />
              </div>

              {/* Party Name */}
              <div className="space-y-2">
                <Label htmlFor="partyName" className="text-white flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-orange-400" />
                  Party Name
                </Label>
                <Input
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g., Birthday Bash, Game Night"
                  className="bg-slate-800/50 border-orange-500/30 text-white text-lg"
                />
              </div>

              {/* Party Join Code - Optional */}
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-400" />
                  Join Code (Optional)
                </Label>
                <Input
                  id="joinCode"
                  value={partyJoinCode}
                  onChange={(e) => setPartyJoinCode(e.target.value)}
                  placeholder="Leave empty for random code"
                  className="bg-slate-800/50 border-green-500/30 text-white font-mono text-lg"
                />
                <p className="text-xs text-gray-400">
                  Share this with your guests. Leave blank for a random 4-digit code.
                </p>
              </div>

              {/* Initialize Button */}
              <Button
                onClick={handleInitialize}
                disabled={initializing || (systemExists && !confirmReset) || !hostName || !partyName}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 shadow-2xl shadow-purple-500/30"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Creating Party...
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6 mr-3" />
                    🚀 CREATE PARTY
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Reference - Only show join code preview */}
        {partyJoinCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Party Join Code</p>
                <p className="text-4xl font-mono font-bold text-white">{partyJoinCode}</p>
                <p className="text-xs text-green-400 mt-2">Share this with your guests!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
