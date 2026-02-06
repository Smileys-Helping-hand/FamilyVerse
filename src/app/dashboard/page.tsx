'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Share2, Users, Copy, Sparkles, Heart, Star, PartyPopper, Video, Gamepad2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FamilyStats } from '@/components/dashboard/FamilyStats';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';

export default function DashboardPage() {
    const { userProfile, family, loading } = useAuth();
    const { toast } = useToast();

    const copyJoinCode = () => {
        if (!family?.joinCode) return;
        navigator.clipboard.writeText(family.joinCode);
        toast({
            title: "Copied!",
            description: "The join code has been copied to your clipboard.",
        });
    }

    if (loading || !userProfile) {
        return (
            <div>
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-6 w-24" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader>
                            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="space-y-3 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                    <h1 className={cn(
                        "text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
                        "bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400",
                        "bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]",
                        "drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    )}>
                        Howzit, {userProfile?.name}! 🤙
                    </h1>
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
                </div>
                <p className="text-base sm:text-lg text-purple-200/80 flex items-center gap-2 flex-wrap">
                    Vibing with{' '}
                    <span className="font-bold text-orange-400 flex items-center gap-1">
                        <Heart className="h-4 w-4 text-purple-400 fill-purple-400 animate-pulse" />
                        {userProfile?.familyName}
                    </span>
                    {' '}squad.
                </p>
            </div>

            {/* Family Stats */}
            <FamilyStats />

            {/* THE PORTAL - Featured Card */}
            <Card className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-2xl",
                "hover:-translate-y-2 border-4 border-purple-500/50",
                "bg-gradient-to-br from-purple-950 via-purple-900 to-violet-950"
            )}>
                {/* Animated Background with Better Blending */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/30 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-600/35 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/25 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                    
                    {/* Gradient overlay for smoother blending */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-transparent to-purple-950/40" />
                </div>
                
                <div className="relative z-10">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500 shadow-2xl flex-shrink-0">
                                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl text-white mb-1">
                                        ✨ The Portal
                                    </CardTitle>
                                    <CardDescription className="text-base sm:text-lg text-purple-200">
                                        Your gateway to all the lekker features
                                    </CardDescription>
                                </div>
                            </div>
                            <Link href="/portal" className="w-full sm:w-auto flex-shrink-0">
                                <Button size="lg" className={cn(
                                    "w-full sm:w-auto bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500",
                                    "hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:hover:scale-110",
                                    "text-base sm:text-lg font-bold shadow-orange-500/50",
                                    "animate-pulse min-h-[48px] px-6"
                                )}>
                                    Enter Portal
                                    <Sparkles className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer">
                                <PartyPopper className="h-8 w-8 text-purple-400 mb-2" />
                                <p className="text-white font-semibold">Party OS</p>
                                <p className="text-sm text-purple-200">Sim Racing & Games</p>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer">
                                <Share2 className="h-8 w-8 text-green-400 mb-2" />
                                <p className="text-white font-semibold">Flash Pay</p>
                                <p className="text-sm text-green-200">Bill Splitter</p>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer">
                                <Star className="h-8 w-8 text-blue-400 mb-2" />
                                <p className="text-white font-semibold">More Apps</p>
                                <p className="text-sm text-blue-200">Coming Soon</p>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
            
            {/* Main Dashboard Cards */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className={cn(
                    "flex flex-col transition-all duration-300 hover:shadow-2xl",
                    "hover:-translate-y-1 sm:hover:-translate-y-2 border-2 hover:border-primary/50",
                    "bg-gradient-to-br from-card via-card to-primary/5"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                           <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary flex-shrink-0">
                               <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                           </div>
                           Family Tree
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            View and manage your interactive family tree.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/dashboard/tree" passHref className="w-full">
                           <Button className={cn(
                               "w-full bg-gradient-to-r from-orange-500 to-pink-600",
                               "hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105",
                               "text-sm sm:text-base font-semibold group min-h-[48px]"
                           )}>
                                Go to Tree 
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                           </Button>
                        </Link>
                    </CardContent>
                </Card>

                 <Card className={cn(
                    "transition-all duration-300 hover:shadow-2xl",
                    "hover:-translate-y-1 sm:hover:-translate-y-2 border-2 hover:border-secondary/50",
                    "bg-gradient-to-br from-card via-card to-secondary/5"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                           <div className="p-2 rounded-xl bg-gradient-to-br from-secondary to-accent flex-shrink-0">
                               <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                           </div>
                           Invite Members
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Share this code with family members so they can join.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className={cn(
                                "flex-1 rounded-xl border-2 border-dashed border-primary/30 p-4",
                                "text-center font-mono text-xl tracking-widest font-bold",
                                "bg-gradient-to-r from-primary/10 to-secondary/10",
                                "hover:shadow-lg transition-all duration-300"
                            )}>
                                {family?.joinCode || <Skeleton className="h-6 w-24 mx-auto" />}
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={copyJoinCode} 
                                disabled={!family?.joinCode}
                                className={cn(
                                    "hover:bg-primary hover:text-primary-foreground",
                                    "transition-all duration-300 hover:scale-110 hover:rotate-12",
                                    "border-2 min-h-[48px] min-w-[48px]"
                                )}
                            >
                                <span className="sr-only">Copy</span>
                                <Copy className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "transition-all duration-300 hover:shadow-2xl",
                    "hover:-translate-y-2 border-2 hover:border-green-500/50",
                    "bg-gradient-to-br from-card via-card to-green-100/20"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
                                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            Parental Controls
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Manage screen time and content safety for children.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/dashboard/parental-controls" passHref className="w-full">
                            <Button className={cn(
                                "w-full bg-gradient-to-r from-green-500 to-emerald-600",
                                "hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105",
                                "text-sm sm:text-base font-semibold group min-h-[48px]"
                            )}>
                                Manage Controls
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Party Games Card */}
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20",
                    "hover:-translate-y-2 border-2 border-purple-500/30 hover:border-purple-500/60",
                    "bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-purple-900/60",
                    "backdrop-blur-sm"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50 flex-shrink-0">
                                <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            Party Games 🎮
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-purple-200/70">
                            Join live party games: Sim Racing, Betting, and Imposter!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/party/join" passHref className="w-full">
                            <Button className={cn(
                                "w-full bg-gradient-to-r from-purple-500 to-pink-600",
                                "hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105",
                                "text-sm sm:text-base font-semibold group min-h-[48px]"
                            )}>
                                Join Party
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* New Groups Card */}
            <Card className={cn(
                "transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20",
                "hover:-translate-y-1 border-2 border-blue-500/30 hover:border-blue-500/60",
                "bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-blue-900/40",
                "backdrop-blur-sm"
            )}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50 flex-shrink-0">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        Groups
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-purple-200/70">
                        Create groups with friends for trips, events, and projects. Stay organized with checklists and recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Link href="/dashboard/groups" className="flex-1">
                            <Button className={cn(
                                "w-full bg-gradient-to-r from-blue-500 to-cyan-600",
                                "hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105",
                                "text-sm sm:text-base font-semibold group min-h-[48px]"
                            )}>
                                View Groups
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Secondary Cards */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <Card className={cn(
                    "transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20",
                    "hover:-translate-y-2 border-2 border-pink-500/30 hover:border-pink-500/60",
                    "bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-pink-900/40",
                    "backdrop-blur-sm"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/50 flex-shrink-0">
                                <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            Fun & Games
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-purple-200/70">
                            Play party games and activities with your family!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/dashboard/games" passHref className="w-full">
                            <Button className={cn(
                                "w-full bg-gradient-to-r from-pink-500 to-rose-500",
                                "hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105",
                                "text-sm sm:text-base font-semibold group min-h-[48px]"
                            )}>
                                Play Games
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20",
                    "hover:-translate-y-2 border-2 border-blue-500/30 hover:border-blue-500/60",
                    "bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-blue-900/40",
                    "backdrop-blur-sm"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50 flex-shrink-0">
                                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            Video Library
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-purple-200/70">
                            Watch fun family videos and educational content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/dashboard/videos" passHref className="w-full">
                            <Button className={cn(
                                "w-full bg-gradient-to-r from-blue-500 to-purple-500",
                                "hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105",
                                "text-sm sm:text-base font-semibold group min-h-[48px]"
                            )}>
                                Watch Videos
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Activity and Events Section */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <ActivityFeed />
                <UpcomingEvents />
            </div>

            {/* Quick Actions */}
            <QuickActions />
        </div>
    );
}
