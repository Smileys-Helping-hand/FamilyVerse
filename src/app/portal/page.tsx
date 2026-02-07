'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  MessageCircle,
  Banknote,
  Calendar,
  ChevronRight,
  Gamepad2,
  Users,
  PartyPopper,
  Zap,
  Clock,
  Gift,
  Receipt,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mini-App definitions
const MINI_APPS = [
  {
    id: 'party-os',
    name: 'The Party OS',
    tagline: 'Host the ultimate braai vibes',
    description: 'Sim Racing, Imposter, Betting & Live Commentary',
    icon: PartyPopper,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    glowColor: 'shadow-purple-500/50',
    href: '/party/join',
    badge: 'Live',
    badgeVariant: 'destructive' as const,
    features: ['🏎️ Sim Racing', '🎭 Imposter', '💰 Betting Pool', '📺 TV Mode'],
    status: 'active',
  },
  {
    id: 'awehchat',
    name: 'AwehChat',
    tagline: 'Real-time messaging',
    description: 'Open the AwehChat messaging portal',
    icon: MessageCircle,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glowColor: 'shadow-indigo-500/50',
    href: '/portal/awehchat',
    external: false,
    badge: 'Chat',
    badgeVariant: 'default' as const,
    features: ['💬 Real-time chat', '👥 Rooms', '🔔 Notifications'],
    status: 'active',
  },
  {
    id: 'flash-pay',
    name: 'Flash Pay',
    tagline: 'Split the bill, no stress',
    description: 'OCR receipt scanner & instant bill splitting',
    icon: Banknote,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    glowColor: 'shadow-green-500/50',
    href: '/portal/flash-pay',
    badge: 'Coming Soon',
    badgeVariant: 'secondary' as const,
    features: ['📸 Scan Receipt', '➗ Auto-Split', '💸 Send Request', '✅ Track Payments'],
    status: 'coming-soon',
  },
  {
    id: 'events',
    name: 'Events',
    tagline: 'Never miss a vibe',
    description: 'Calendar, RSVPs & Group Planning',
    icon: Calendar,
    gradient: 'from-blue-500 via-cyan-500 to-sky-500',
    glowColor: 'shadow-blue-500/50',
    href: '/dashboard',
    badge: 'Beta',
    badgeVariant: 'outline' as const,
    features: ['📅 Shared Calendar', '✋ RSVP Tracking', '🎉 Event Reminders', '📍 Location Sharing'],
    status: 'beta',
  },
  {
    id: 'games-hub',
    name: 'Games Hub',
    tagline: 'Play together, anywhere',
    description: 'Family games, trivia & challenges',
    icon: Gamepad2,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'shadow-orange-500/50',
    href: '/dashboard/games',
    badge: 'Active',
    badgeVariant: 'default' as const,
    features: ['🎮 Multiplayer', '🧩 Trivia', '🏆 Leaderboards', '🎁 Rewards'],
    status: 'active',
  },
  {
    id: 'groups',
    name: 'Groups',
    tagline: 'Squad goals made easy',
    description: 'Trip planning, checklists & recommendations',
    icon: Users,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glowColor: 'shadow-violet-500/50',
    href: '/dashboard/groups',
    badge: 'Active',
    badgeVariant: 'default' as const,
    features: ['✅ Checklists', '🗺️ Trip Planner', '💡 Recommendations', '📊 Polls'],
    status: 'active',
  },
  {
    id: 'rewards',
    name: 'Rewards',
    tagline: 'Earn while you vibe',
    description: 'Points, achievements & unlockables',
    icon: Gift,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    glowColor: 'shadow-pink-500/50',
    href: '/portal/rewards',
    badge: 'Coming Soon',
    badgeVariant: 'secondary' as const,
    features: ['⭐ Points System', '🏅 Achievements', '🎁 Prizes', '🔓 Unlockables'],
    status: 'coming-soon',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PortalPage() {
  const { userProfile, loading } = useAuth();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-orange-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-orange-900 relative overflow-hidden">
      {/* Animated Background with Better Blending */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-pink-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Additional gradient overlay for smoother blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white flex items-center gap-3">
                The Portal
                <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
              </h1>
              <p className="text-xl text-purple-200 mt-1">
                Howzit, <span className="font-bold text-orange-400">{userProfile.name}</span>! 🤙
              </p>
            </div>
          </div>
          
          <p className="text-lg text-slate-300 max-w-3xl">
            Your gateway to all the lekker features. Choose your vibe and let's get the party started! 🔥
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="bg-slate-900/50 backdrop-blur-lg border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">Points</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-lg border-orange-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <PartyPopper className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-sm text-slate-400">Events</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-lg border-pink-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{userProfile.familyName}</p>
                <p className="text-sm text-slate-400">Family</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-lg border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">Online</p>
                <p className="text-sm text-slate-400">Status</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mini-Apps Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {MINI_APPS.map((app) => {
            const Icon = app.icon;
            const isComingSoon = app.status === 'coming-soon';
            
            return (
              <motion.div key={app.id} variants={item}>
                <Card
                  className={cn(
                    'group relative overflow-hidden transition-all duration-300 h-full',
                    'bg-slate-900/50 backdrop-blur-lg border-2',
                    'border-slate-700/50 hover:border-slate-600',
                    !isComingSoon && 'hover:shadow-2xl hover:-translate-y-2',
                    isComingSoon && 'opacity-75'
                  )}
                >
                  {/* Gradient Background */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity',
                    app.gradient
                  )} />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        'p-3 rounded-xl bg-gradient-to-br shadow-lg',
                        app.gradient,
                        !isComingSoon && 'group-hover:scale-110 transition-transform'
                      )}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <Badge variant={app.badgeVariant} className="text-xs">
                        {app.badge}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-2xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
                      {app.name}
                    </CardTitle>
                    
                    <CardDescription className="text-slate-400 text-base">
                      {app.tagline}
                    </CardDescription>
                    
                    <p className="text-sm text-slate-300 mt-2">
                      {app.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {app.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-400 bg-slate-800/50 rounded-lg px-2 py-1"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* Launch Button */}
                    {!isComingSoon ? (
                      <Link href={app.href} className="block">
                        <Button
                          className={cn(
                            'w-full bg-gradient-to-r text-white font-semibold',
                            'hover:shadow-xl transition-all group/btn',
                            app.gradient,
                            app.glowColor
                          )}
                        >
                          Launch App
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="w-full"
                        variant="outline"
                      >
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Access Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/party/join">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/50">
              <PartyPopper className="w-4 h-4 mr-2" />
              Quick Join Party
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
