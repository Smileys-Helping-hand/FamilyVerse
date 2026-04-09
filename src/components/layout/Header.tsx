'use client';

import Link from 'next/link';
import { UserNav } from './UserNav';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';
import { usePathname } from 'next/navigation';
import { NotificationCenter } from '../ui/notification-center';
import { cn } from '@/lib/utils';
import { Zap, MapPin, Users, Package, Gamepad2 } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Outings',  href: '/events',            icon: MapPin,    match: '/events' },
  { label: 'The Gang', href: '/dashboard/the-gang', icon: Users,     match: '/dashboard/the-gang' },
  { label: 'My Gear',  href: '/dashboard/gear',     icon: Package,   match: '/dashboard/gear' },
  { label: 'Arcade',   href: '/game',               icon: Gamepad2,  match: '/game' },
];

export default function Header() {
    const { userProfile, loading } = useAuth();
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl overflow-x-hidden">
            <div className="container flex h-16 items-center gap-4 px-4">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
                    <Zap className="h-6 w-6 text-[#00FF66] drop-shadow-[0_0_8px_#00FF66]" />
                    <span className="font-extrabold text-xl tracking-tight text-[#00FF66] drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]">
                        Gang Gear
                    </span>
                </Link>

                {/* Primary nav */}
                <nav className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
                    {NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
                        const active = pathname === match || pathname?.startsWith(match + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                                    active
                                        ? 'bg-[#00FF66]/10 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-3 shrink-0">
                    <NotificationCenter />
                    {loading ? (
                        <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                    ) : (
                        userProfile && <UserNav userProfile={userProfile} />
                    )}
                </div>
            </div>
        </header>
    );
}
