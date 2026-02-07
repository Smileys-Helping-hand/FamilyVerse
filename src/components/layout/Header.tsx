'use client';

import { Leaf, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from '../ui/theme-switcher';
import { NotificationCenter } from '../ui/notification-center';
import { cn } from '@/lib/utils';
// next-auth removed from header controls; admin sign-in moved to /admin/login

export default function Header() {
    const { userProfile, loading } = useAuth();
    const pathname = usePathname();
    
    return (
        <header className="sticky top-0 z-40 w-full border-b-2 border-primary/20 bg-card/80 backdrop-blur-xl shadow-lg">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <Sparkles className="h-8 w-8 text-orange-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 drop-shadow-lg" />
                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                        </div>
                        <span className={cn(
                            "hidden font-bold text-2xl sm:inline-block",
                            "bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500",
                            "bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
                        )}>
                            FamilyVerse
                        </span>
                    </Link>
                </div>

                <nav className="flex flex-1 items-center space-x-2 md:space-x-3">
                    <Link href="/dashboard">
                        <Button 
                            variant={pathname === '/dashboard' ? 'default' : 'ghost'} 
                            size="sm"
                            className={cn(
                                "transition-all duration-300 font-semibold",
                                pathname === '/dashboard' 
                                    ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 shadow-primary/50' 
                                    : 'hover:bg-primary/10 hover:scale-105'
                            )}
                        >
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/portal">
                        <Button 
                            variant={pathname?.startsWith('/portal') ? 'default' : 'ghost'} 
                            size="sm"
                            className={cn(
                                "transition-all duration-300 font-semibold",
                                pathname?.startsWith('/portal')
                                    ? 'bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:shadow-xl hover:scale-105 shadow-orange-500/50' 
                                    : 'hover:bg-orange-500/10 hover:scale-105'
                            )}
                        >
                            ✨ Portal
                        </Button>
                    </Link>
                    <Link href="/dashboard/tree">
                        <Button 
                            variant={pathname === '/dashboard/tree' ? 'default' : 'ghost'} 
                            size="sm"
                            className={cn(
                                "transition-all duration-300 font-semibold",
                                pathname === '/dashboard/tree'
                                    ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 shadow-primary/50' 
                                    : 'hover:bg-primary/10 hover:scale-105'
                            )}
                        >
                            Family Tree
                        </Button>
                    </Link>
                    <Link href="/dashboard/groups">
                        <Button 
                            variant={pathname?.startsWith('/dashboard/groups') ? 'default' : 'ghost'} 
                            size="sm"
                            className={cn(
                                "transition-all duration-300 font-semibold",
                                pathname?.startsWith('/dashboard/groups')
                                    ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 shadow-primary/50' 
                                    : 'hover:bg-primary/10 hover:scale-105'
                            )}
                        >
                            Groups
                        </Button>
                    </Link>
                    <Link href="/dashboard/parental-controls">
                        <Button 
                            variant={pathname === '/dashboard/parental-controls' ? 'default' : 'ghost'} 
                            size="sm"
                            className={cn(
                                "gap-1 transition-all duration-300 font-semibold",
                                pathname === '/dashboard/parental-controls'
                                    ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-105 shadow-primary/50' 
                                    : 'hover:bg-primary/10 hover:scale-105'
                            )}
                        >
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Parental Controls</span>
                            <span className="sm:hidden">Controls</span>
                        </Button>
                    </Link>
                </nav>

                <div className="flex items-center space-x-3">
                    <NotificationCenter />
                    <ThemeSwitcher />
                    <nav className="flex items-center space-x-1">
                        {loading ? (
                            <Skeleton className="h-8 w-8 rounded-full" />
                        ) : (
                            <>
                                {userProfile && <UserNav userProfile={userProfile} />}
                                {/* Admin sign-in removed from header; use /admin/login for access */}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

function AdminAuthControls() {
    const { data: session } = useSession();

    if (session?.user?.email) {
        return (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign out
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="sm" onClick={() => signIn('credentials')}>
            Admin Sign-in
        </Button>
    );
}
