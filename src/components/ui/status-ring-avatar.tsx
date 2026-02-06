'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export type UserStatus = 'online' | 'racing' | 'imposter' | 'party' | 'offline';

interface StatusRingAvatarProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatus;
  className?: string;
}

const statusConfig = {
  online: {
    ring: 'ring-green-500',
    glow: 'shadow-green-500/50',
    pulse: true,
    label: 'Online & Chatting',
  },
  racing: {
    ring: 'ring-checkered-pattern',
    glow: 'shadow-yellow-500/50',
    pulse: false,
    label: 'In the Sim Rig 🏎️',
    animation: 'animate-spin-slow',
  },
  imposter: {
    ring: 'ring-red-500',
    glow: 'shadow-red-500/50',
    pulse: true,
    label: 'Playing Imposter (Don\'t Disturb!)',
  },
  party: {
    ring: 'ring-purple-500',
    glow: 'shadow-purple-500/50',
    pulse: true,
    label: 'In Party Mode 🎉',
  },
  offline: {
    ring: 'ring-slate-600',
    glow: '',
    pulse: false,
    label: 'Offline',
  },
};

const sizeConfig = {
  sm: {
    avatar: 'h-8 w-8',
    ring: 'ring-2',
  },
  md: {
    avatar: 'h-10 w-10',
    ring: 'ring-2',
  },
  lg: {
    avatar: 'h-12 w-12',
    ring: 'ring-4',
  },
  xl: {
    avatar: 'h-16 w-16',
    ring: 'ring-4',
  },
};

// Auto-detect status based on current page
export function useUserStatus(): UserStatus {
  const pathname = usePathname();
  const [status, setStatus] = useState<UserStatus>('online');

  useEffect(() => {
    if (pathname?.includes('/party/racing') || pathname?.includes('/party/tv')) {
      setStatus('racing');
    } else if (pathname?.includes('/party/imposter')) {
      setStatus('imposter');
    } else if (pathname?.startsWith('/party')) {
      setStatus('party');
    } else {
      setStatus('online');
    }
  }, [pathname]);

  return status;
}

export function StatusRingAvatar({
  src,
  fallback,
  size = 'md',
  status = 'online',
  className,
}: StatusRingAvatarProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <div className="relative inline-block group">
      {/* Avatar with Status Ring */}
      <div className={cn(
        'rounded-full',
        sizeStyles.ring,
        config.ring,
        config.glow,
        config.pulse && 'animate-pulse',
        'animation' in config ? config.animation : '',
        'transition-all duration-300',
        'group-hover:scale-110',
        className
      )}>
        <Avatar className={sizeStyles.avatar}>
          <AvatarImage src={src} />
          <AvatarFallback className="bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500 text-white font-bold">
            {fallback}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Status Indicator Dot */}
      <div className={cn(
        'absolute bottom-0 right-0 rounded-full border-2 border-background',
        size === 'sm' && 'h-2.5 w-2.5',
        size === 'md' && 'h-3 w-3',
        size === 'lg' && 'h-3.5 w-3.5',
        size === 'xl' && 'h-4 w-4',
        status === 'online' && 'bg-green-500',
        status === 'racing' && 'bg-yellow-500',
        status === 'imposter' && 'bg-red-500',
        status === 'party' && 'bg-purple-500',
        status === 'offline' && 'bg-slate-600',
        config.pulse && 'animate-pulse'
      )} />

      {/* Tooltip on Hover */}
      <div className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
        'px-3 py-1.5 rounded-lg',
        'bg-slate-900 text-white text-xs font-medium whitespace-nowrap',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'pointer-events-none z-50',
        'shadow-xl border border-slate-700'
      )}>
        {config.label}
      </div>
    </div>
  );
}

// Checkered Pattern for Racing Status
export function CheckeredRing() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <pattern id="checkered" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="4" fill="white" />
          <rect x="4" y="4" width="4" height="4" fill="white" />
          <rect x="0" y="4" width="4" height="4" fill="black" />
          <rect x="4" y="0" width="4" height="4" fill="black" />
        </pattern>
      </defs>
    </svg>
  );
}
