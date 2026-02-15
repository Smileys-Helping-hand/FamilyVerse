'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowRight, Share2, Users, Copy, Sparkles, Heart, Star, PartyPopper, Video, Gamepad2, Shield, Skull, UserPlus, LayoutGrid, Calendar, ChevronDown, Clapperboard, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FamilyStats } from '@/components/dashboard/FamilyStats';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { ImposterCard } from '@/components/party/ImposterCard';

export default function DashboardPage() {
    const { userProfile, family, loading } = useAuth();
    const { toast } = useToast();
    const [statsOpen, setStatsOpen] = useState(true);
    const [activityOpen, setActivityOpen] = useState(true);
    const [actionsOpen, setActionsOpen] = useState(true);
    const [familyToolsOpen, setFamilyToolsOpen] = useState(true);
    const [familyGroupsOpen, setFamilyGroupsOpen] = useState(true);
    const [partyPortalOpen, setPartyPortalOpen] = useState(true);
    const [partyGamesOpen, setPartyGamesOpen] = useState(true);
    const [eventsSearch, setEventsSearch] = useState('');
    const [eventsStatus, setEventsStatus] = useState('ALL');
    const [eventsRange, setEventsRange] = useState('all');

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

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="flex flex-wrap gap-2">
                    <TabsTrigger value="overview" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="family" className="gap-2">
                        <Users className="h-4 w-4" />
                        Family
                    </TabsTrigger>
                    <TabsTrigger value="events" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Events
                    </TabsTrigger>
                    <TabsTrigger value="party" className="gap-2">
                        <PartyPopper className="h-4 w-4" />
                        Party
                    </TabsTrigger>
                    <TabsTrigger value="media" className="gap-2">
                        <Clapperboard className="h-4 w-4" />
                        Media & Fun
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="gap-2">
                        <Wrench className="h-4 w-4" />
                        Tools
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                title: 'Events Hub',
                                subtitle: 'Plan the next outing',
                                href: '/events',
                                icon: Calendar,
                                gradient: 'from-blue-500 to-cyan-600',
                                delay: '0ms',
                            },
                            {
                                title: 'Family Tree',
                                subtitle: 'Grow your roots',
                                href: '/dashboard/tree',
                                icon: Users,
                                gradient: 'from-orange-500 to-pink-600',
                                delay: '80ms',
                            },
                            {
                                title: 'Party OS',
                                subtitle: 'Games and live play',
                                href: '/party/join',
                                icon: PartyPopper,
                                gradient: 'from-purple-500 to-pink-600',
                                delay: '160ms',
                            },
                            {
                                title: 'Heritage Vault',
                                subtitle: 'Stories and recipes',
                                href: '/family/heritage',
                                icon: Star,
                                gradient: 'from-amber-500 to-orange-500',
                                delay: '240ms',
                            },
                        ].map((tile) => (
                            <Link key={tile.title} href={tile.href}>
                                <Card
                                    className={cn(
                                        'group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1',
                                        'border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/10',
                                        'animate-in fade-in slide-in-from-bottom-4'
                                    )}
                                    style={{ animationDelay: tile.delay }}
                                >
                                    <CardHeader>
                                        <div className={cn('p-3 rounded-xl bg-gradient-to-br', tile.gradient, 'w-fit')}>
                                            <tile.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <CardTitle className="text-lg">{tile.title}</CardTitle>
                                        <CardDescription>{tile.subtitle}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="ghost" className="gap-2">
                                            Open
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                    <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
                        <Card className="border-2 border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Family Snapshot</CardTitle>
                                    <CardDescription>Stats and progress for your family</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", statsOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <FamilyStats />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
                        <Card className="border-2 border-secondary/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Activity & Events</CardTitle>
                                    <CardDescription>Latest family activity and upcoming plans</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", activityOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                                        <ActivityFeed />
                                        <UpcomingEvents />
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
                        <Card className="border-2 border-accent/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                    <CardDescription>Jump to the most-used tools</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", actionsOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <QuickActions />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </TabsContent>

                <TabsContent value="family" className="space-y-6">
                    <Collapsible open={familyToolsOpen} onOpenChange={setFamilyToolsOpen}>
                        <Card className="border-2 border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Family Essentials</CardTitle>
                                    <CardDescription>Tree, invites, and the family core</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", familyToolsOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <Collapsible open={familyGroupsOpen} onOpenChange={setFamilyGroupsOpen}>
                        <Card className="border-2 border-blue-500/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Groups & Projects</CardTitle>
                                    <CardDescription>Collaborate on trips, events, and tasks</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", familyGroupsOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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
                                                    Create groups with friends for trips, events, and projects.
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
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </TabsContent>

                <TabsContent value="events" className="space-y-6">
                    <Card className="border-2 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Find Events Fast</CardTitle>
                            <CardDescription>Search, filter, and jump straight in</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-[1fr,180px,180px]">
                                <Input
                                    value={eventsSearch}
                                    onChange={(event) => setEventsSearch(event.target.value)}
                                    placeholder="Search by title, location, or description"
                                />
                                <Select value={eventsStatus} onValueChange={setEventsStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Statuses</SelectItem>
                                        <SelectItem value="LIVE">Live</SelectItem>
                                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                        <SelectItem value="PAST">Past</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={eventsRange} onValueChange={setEventsRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Date Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">This Week</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={eventsRange === 'today' ? 'default' : 'outline'}
                                    onClick={() => setEventsRange('today')}
                                >
                                    Today
                                </Button>
                                <Button
                                    type="button"
                                    variant={eventsRange === 'week' ? 'default' : 'outline'}
                                    onClick={() => setEventsRange('week')}
                                >
                                    This Week
                                </Button>
                                <Button
                                    type="button"
                                    variant={eventsRange === 'month' ? 'default' : 'outline'}
                                    onClick={() => setEventsRange('month')}
                                >
                                    This Month
                                </Button>
                                <Button
                                    type="button"
                                    variant={eventsRange === 'all' ? 'default' : 'outline'}
                                    onClick={() => setEventsRange('all')}
                                >
                                    All Time
                                </Button>
                                <Link
                                    href={`/events?search=${encodeURIComponent(eventsSearch)}&status=${eventsStatus}&range=${eventsRange}`}
                                    className="ml-auto"
                                >
                                    <Button className="gap-2">
                                        Open Events
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                        <Card className={cn(
                            "transition-all duration-300 hover:shadow-2xl",
                            "hover:-translate-y-1 sm:hover:-translate-y-2 border-2 hover:border-blue-500/50",
                            "bg-gradient-to-br from-card via-card to-blue-100/10"
                        )}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0">
                                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    Event Hub
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Plan, coordinate, and manage your family outings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-3">
                                <Link href="/events" className="flex-1">
                                    <Button className={cn(
                                        "w-full bg-gradient-to-r from-blue-500 to-cyan-600",
                                        "hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105",
                                        "text-sm sm:text-base font-semibold group min-h-[48px]"
                                    )}>
                                        Open Events
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <Link href="/events/create" className="flex-1">
                                    <Button variant="outline" className="w-full min-h-[48px]">
                                        Create Event
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "transition-all duration-300 hover:shadow-2xl",
                            "hover:-translate-y-1 sm:hover:-translate-y-2 border-2 hover:border-purple-500/50",
                            "bg-gradient-to-br from-card via-card to-purple-100/10"
                        )}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
                                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    Planning Highlights
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Check what is coming up and who is joining.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UpcomingEvents />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="party" className="space-y-6">
                    <Collapsible open={partyPortalOpen} onOpenChange={setPartyPortalOpen}>
                        <Card className="border-2 border-purple-500/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Portal Access</CardTitle>
                                    <CardDescription>Launch the Party OS and key features</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", partyPortalOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <Card className={cn(
                                        "relative overflow-hidden transition-all duration-300 hover:shadow-2xl",
                                        "hover:-translate-y-2 border-4 border-purple-500/50",
                                        "bg-gradient-to-br from-purple-950 via-purple-900 to-violet-950"
                                    )}>
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/30 rounded-full blur-[100px] animate-pulse" />
                                            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-600/35 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/25 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
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
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    <Collapsible open={partyGamesOpen} onOpenChange={setPartyGamesOpen}>
                        <Card className="border-2 border-red-500/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Party Games & HQ</CardTitle>
                                    <CardDescription>Join live games and watch the Imposter HQ</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <ChevronDown className={cn("h-5 w-5 transition-transform", partyGamesOpen && "rotate-180")} />
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent>
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

                        <Card className={cn(
                            "relative overflow-hidden border-2 border-red-500/40",
                            "bg-gradient-to-br from-red-950/70 via-slate-900/80 to-red-900/60",
                            "shadow-lg shadow-red-500/10"
                        )}>
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-xl">
                                            <Skull className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-white">Imposter HQ</CardTitle>
                                            <CardDescription className="text-red-100/80">
                                                Live role reveal, alerts, and status for the current round.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link href="/party/join">
                                            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-xl">
                                                Join Party
                                            </Button>
                                        </Link>
                                        <Link href="/party/dashboard">
                                            <Button variant="outline" className="border-red-300/40 text-white hover:bg-white/10">
                                                Open Party Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="max-w-3xl">
                                    <ImposterCard />
                                </div>
                            </CardContent>
                        </Card>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
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
                </TabsContent>

                <TabsContent value="tools" className="space-y-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

                        <Card className={cn(
                            "border-2 border-blue-500/30",
                            "bg-gradient-to-br from-blue-950/50 via-slate-900/70 to-cyan-900/40"
                        )}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <UserPlus className="h-5 w-5 text-cyan-300" />
                                    Invite Friends to Sign Up
                                </CardTitle>
                                <CardDescription className="text-blue-100/80">
                                    Get everyone an account so their games, scores, and participation are tracked.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-3">
                                <Link href="/signup" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                                        Create an Account
                                    </Button>
                                </Link>
                                <Link href="/login" className="flex-1">
                                    <Button variant="outline" className="w-full border-blue-300/40 text-white hover:bg-white/10">
                                        Log In
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
