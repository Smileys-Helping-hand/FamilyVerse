"use client";

import type { FamilyMember } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Cake, Heart, Users } from "lucide-react";

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

export function FamilyTreeNode({ member, allMembers }: FamilyTreeNodeProps) {
    return (
        <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={member.photoUrl || undefined} alt={member.name} data-ai-hint="person portrait" />
                    <AvatarFallback className="text-xl">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="capitalize">{member.gender || 'Not specified'}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground p-4 pt-0">
                {member.birthDate && (
                    <div className="flex items-center gap-2">
                        <Cake className="h-4 w-4 flex-shrink-0" />
                        <span>Born: {format(member.birthDate.toDate(), 'PPP')}</span>
                    </div>
                )}
                {member.parents?.length > 0 && (
                     <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-foreground -mt-0.5">Parents</p>
                            <p className="leading-snug">{member.parents.map(pId => findMemberName(pId, allMembers)).join(' & ')}</p>
                        </div>
                    </div>
                )}
                {member.spouses?.length > 0 && (
                     <div className="flex items-start gap-2">
                        <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                         <div>
                            <p className="font-medium text-foreground -mt-0.5">Spouse(s)</p>
                            <p className="leading-snug">{member.spouses.map(sId => findMemberName(sId, allMembers)).join(', ')}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
