'use client';

import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';

export default function Header() {
    const { userProfile, loading } = useAuth();
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <Leaf className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">FamilyVerse</span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-1">
                        {loading ? <Skeleton className="h-8 w-8 rounded-full" /> : userProfile && <UserNav userProfile={userProfile} />}
                    </nav>
                </div>
            </div>
        </header>
    )
}
