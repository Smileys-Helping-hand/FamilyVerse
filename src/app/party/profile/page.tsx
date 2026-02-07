'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  getCurrentProfileAction, 
  updateProfileAction, 
  AVATAR_EMOJIS, 
  COLOR_OPTIONS 
} from '@/app/actions/profile';
import { 
  User, 
  Palette,
  Save,
  Sparkles,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😎');
  const [bio, setBio] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('purple');
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await getCurrentProfileAction();
      if (profile) {
        setDisplayName(profile.displayName || profile.name);
        setOriginalName(profile.name);
        setAvatarEmoji(profile.avatarEmoji || '😎');
        setBio(profile.bio || '');
        setFavoriteColor(profile.favoriteColor || 'purple');
        setWalletBalance(profile.walletBalance);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfileAction({
        displayName: displayName.trim() || originalName,
        avatarEmoji,
        bio,
        favoriteColor,
      });
      
      if (result.success) {
        toast({ title: '✨ Profile Updated!', description: 'Looking good!' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🎨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/party/dashboard">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8 text-purple-400" />
              Edit Profile
            </h1>
            <p className="text-gray-400">Customize how others see you</p>
          </div>
        </div>

        {/* Avatar Preview Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Card className={`bg-gradient-to-br from-${favoriteColor}-900/50 to-${favoriteColor}-800/30 border-${favoriteColor}-500/30`}>
            <CardContent className="p-6 flex items-center gap-6">
              <div className="text-7xl">{avatarEmoji}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{displayName || originalName}</h2>
                <p className="text-gray-400 text-sm">{bio || 'Ready to party! 🎉'}</p>
                <div className="flex items-center gap-2 mt-2 text-yellow-400">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono font-bold">{walletBalance}</span>
                  <span className="text-gray-500 text-xs">pts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Display Name */}
        <Card className="bg-black/40 border-purple-500/30 mb-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Display Name
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose a nickname to show on leaderboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={originalName}
              className="bg-black/50 border-gray-700 text-lg"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-2">
              Original name: {originalName}
            </p>
          </CardContent>
        </Card>

        {/* Avatar Emoji */}
        <Card className="bg-black/40 border-purple-500/30 mb-4">
          <CardHeader>
            <CardTitle className="text-white">🎭 Avatar</CardTitle>
            <CardDescription className="text-gray-400">
              Pick your party persona
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-purple-600 scale-110 ring-2 ring-purple-400'
                      : 'bg-black/30 hover:bg-black/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="bg-black/40 border-purple-500/30 mb-4">
          <CardHeader>
            <CardTitle className="text-white">📝 Tagline</CardTitle>
            <CardDescription className="text-gray-400">
              A short bio or catchphrase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ready to party! 🎉"
              className="bg-black/50 border-gray-700"
              maxLength={50}
            />
          </CardContent>
        </Card>

        {/* Favorite Color */}
        <Card className="bg-black/40 border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Theme Color
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personalize your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFavoriteColor(color.value)}
                  className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                    favoriteColor === color.value
                      ? 'ring-4 ring-white scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
