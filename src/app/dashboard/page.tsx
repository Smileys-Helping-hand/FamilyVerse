'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Share2, Users, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.name}!</h1>
                <p className="text-muted-foreground">
                    You are a member of the <span className="font-semibold text-primary">{userProfile?.familyName}</span> family.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Users className="h-6 w-6 text-primary" />
                           Family Tree
                        </CardTitle>
                        <CardDescription>
                            View and manage your interactive family tree.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Link href="/dashboard/tree" passHref>
                           <Button>
                                Go to Tree <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Share2 className="h-6 w-6 text-primary" />
                           Invite Members
                        </CardTitle>
                        <CardDescription>
                            Share this code with family members so they can join.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 rounded-md border border-dashed p-3 text-center font-mono text-lg tracking-widest bg-muted">
                                {family?.joinCode || <Skeleton className="h-6 w-24 mx-auto" />}
                            </div>
                            <Button variant="outline" size="icon" onClick={copyJoinCode} disabled={!family?.joinCode}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Activity Feed</CardTitle>
                        <CardDescription>
                            See the latest updates to your family tree.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
