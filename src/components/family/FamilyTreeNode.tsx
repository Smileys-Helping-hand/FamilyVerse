"use client";

import type { FamilyMember } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Cake, Heart, Users, Crown, Baby, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FamilyTreeNodeProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const findMemberName = (id: string, allMembers: FamilyMember[]) => {
  return allMembers.find(m => m.id === id)?.name || 'Unknown';
}

const getGenderIcon = (gender: string | undefined) => {
  if (gender === 'male') return User;
  if (gender === 'female') return User;
  return User;
};

const getGenderColor = (gender: string | undefined) => {
  if (gender === 'male') return 'from-blue-500 to-cyan-500';
  if (gender === 'female') return 'from-pink-500 to-rose-500';
  return 'from-purple-500 to-indigo-500';
};

export function FamilyTreeNode({ member, allMembers }: FamilyTreeNodeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const GenderIcon = getGenderIcon(member.gender);
    const genderColor = getGenderColor(member.gender);
    
    return (
        <Card 
            className={cn(
                "transition-all duration-300 border-2 group",
                "hover:shadow-2xl hover:-translate-y-2",
                "hover:border-primary/50 cursor-pointer",
                "bg-gradient-to-br from-card via-card to-muted/20",
                "overflow-hidden relative"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated background gradient */}
            <div 
                className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                    `bg-gradient-to-br ${genderColor}`
                )}
            />
            
            <CardHeader className="flex flex-col items-center gap-4 p-6 relative">
                <div className="relative">
                    <Avatar className={cn(
                        "h-24 w-24 border-4 border-background shadow-xl",
                        "transition-all duration-300",
                        "group-hover:scale-110 group-hover:shadow-2xl",
                        "ring-4 ring-offset-2",
                        isHovered ? `ring-primary` : 'ring-transparent'
                    )}>
                        <AvatarImage 
                            src={member.photoUrl || undefined} 
                            alt={member.name} 
                            data-ai-hint="person portrait"
                            className="object-cover"
                        />
                        <AvatarFallback className={cn(
                            "text-2xl font-bold",
                            `bg-gradient-to-br ${genderColor} text-white`
                        )}>
                            {getInitials(member.name)}
                        </AvatarFallback>
                    </Avatar>
                    {/* Gender indicator */}
                    <div className={cn(
                        "absolute -bottom-1 -right-1 p-1.5 rounded-full",
                        "bg-background shadow-lg border-2 border-background",
                        "transition-transform duration-300",
                        isHovered && "scale-110"
                    )}>
                        <div className={cn(
                            "p-1 rounded-full",
                            `bg-gradient-to-br ${genderColor}`
                        )}>
                            <GenderIcon className="h-3 w-3 text-white" />
                        </div>
                    </div>
                </div>
                
                <div className="text-center space-y-1">
                    <CardTitle className={cn(
                        "text-xl font-bold transition-colors",
                        isHovered && "text-primary"
                    )}>
                        {member.name}
                    </CardTitle>
                    {member.gender && (
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "capitalize font-medium",
                                "transition-all duration-300",
                                isHovered && "scale-105"
                            )}
                        >
                            {member.gender}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-3 text-sm p-6 pt-0 relative">
                {member.birthDate && (
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        "bg-muted/50 border border-border/50",
                        "transition-all duration-300",
                        "hover:bg-muted hover:border-primary/30"
                    )}>
                        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-md">
                            <Cake className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">Birthday</p>
                            <p className="font-semibold text-foreground truncate">
                                {format(member.birthDate.toDate(), 'PPP')}
                            </p>
                        </div>
                    </div>
                )}
                
                {member.parents?.length > 0 && (
                    <div className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        "bg-muted/50 border border-border/50",
                        "transition-all duration-300",
                        "hover:bg-muted hover:border-primary/30"
                    )}>
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">Parents</p>
                            <p className="font-semibold text-foreground leading-snug">
                                {member.parents.map(pId => findMemberName(pId, allMembers)).join(' & ')}
                            </p>
                        </div>
                    </div>
                )}
                
                {member.spouses?.length > 0 && (
                    <div className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        "bg-muted/50 border border-border/50",
                        "transition-all duration-300",
                        "hover:bg-muted hover:border-primary/30"
                    )}>
                        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shadow-md">
                            <Heart className="h-4 w-4 text-white fill-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">Spouse(s)</p>
                            <p className="font-semibold text-foreground leading-snug">
                                {member.spouses.map(sId => findMemberName(sId, allMembers)).join(', ')}
                            </p>
                        </div>
                    </div>
                )}
                
                {!member.birthDate && !member.parents?.length && !member.spouses?.length && (
                    <div className="text-center py-4 text-muted-foreground text-xs">
                        No additional information
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
