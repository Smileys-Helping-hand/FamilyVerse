'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusRingAvatar, useUserStatus } from "@/components/ui/status-ring-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from "@/types";
import { LogOut, User, PartyPopper, Shield, Sparkles } from "lucide-react";
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserNavProps {
    userProfile: UserProfile;
}

export function UserNav({ userProfile }: UserNavProps) {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const status = useUserStatus();
    const { data: session } = useSession();
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
            toast({ 
                title: "Sharp sharp! 👋", 
                description: "Catch you later, china!" 
            });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Eish! 😅", description: error.message });
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <StatusRingAvatar
                        fallback={getInitials(userProfile.name)}
                        status={status}
                        size="md"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {userProfile.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href="/portal">
                        <DropdownMenuItem>
                            <Sparkles className="mr-2 h-4 w-4 text-orange-500" />
                            <span className="font-semibold">The Portal ✨</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <Link href="/party/join">
                        <DropdownMenuItem>
                            <PartyPopper className="mr-2 h-4 w-4" />
                            <span>Party Games 🎮</span>
                        </DropdownMenuItem>
                    </Link>
                    {(userProfile.role === 'admin' || userProfile.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                        <Link href={(session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || userProfile.role === 'admin') ? '/admin' : '/admin/login'}>
                            <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Control Panel</span>
                            </DropdownMenuItem>
                        </Link>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
