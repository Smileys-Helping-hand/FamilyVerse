'use client';

import Link from 'next/link';
import { UserNav } from './UserNav';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '../ui/skeleton';
import { usePathname } from 'next/navigation';
import { NotificationCenter } from '../ui/notification-center';
import { cn } from '@/lib/utils';
import { Calendar, Users, Sparkles, Home, MessageCircle } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home',    href: '/dashboard',          icon: Home,         match: '/dashboard' },
  { label: 'Events',  href: '/events',             icon: Calendar,     match: '/events' },
  { label: 'People',  href: '/dashboard/the-gang', icon: Users,        match: '/dashboard/the-gang' },
  { label: 'Chat',    href: '/portal/awehchat',    icon: MessageCircle, match: '/portal/awehchat' },
];

export default function Header() {
  const { userProfile, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass overflow-x-hidden">
      <div className="container flex h-16 items-center gap-4 px-4 max-w-6xl mx-auto">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl group-hover:animate-bounce transition-all select-none">🏡</span>
          <span className="font-extrabold text-xl tracking-tight text-gradient hidden sm:block">
            FamilyVerse
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="flex flex-1 min-w-0 items-center gap-1 overflow-x-auto pr-2 scrollbar-hide">
          {NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
            const active = pathname === match || pathname?.startsWith(match + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-foreground/55 hover:text-foreground hover:bg-muted/70'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full bg-muted" />
          ) : (
            userProfile && <UserNav userProfile={userProfile} />
          )}
        </div>
      </div>
    </header>
  );
}
