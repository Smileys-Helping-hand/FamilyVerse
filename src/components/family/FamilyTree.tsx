"use client";

import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useFirestore } from "@/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { FamilyMember } from "@/types";
import { FamilyTreeNode } from "./FamilyTreeNode";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2 } from "lucide-react";

export function FamilyTree() {
  const { family } = useAuthContext();
  const db = useFirestore();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family?.id) return;

    setLoading(true);
    const membersQuery = query(
      collection(db, `families/${family.id}/members`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(membersQuery, (querySnapshot) => {
      const membersData: FamilyMember[] = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() } as FamilyMember);
      });
      setMembers(membersData);
      setLoading(false);
    }, () => {
        setLoading(false);
    });

    return () => unsubscribe();
  }, [family?.id, db]);

  if (loading) {
    return (
        <div className="mt-16 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className="p-6 border-2 rounded-2xl shadow-lg bg-card/50 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-5 w-3/4 mx-auto" />
                                <Skeleton className="h-4 w-1/2 mx-auto" />
                                <Skeleton className="h-3 w-2/3 mx-auto" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)] rounded-2xl border-2 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-6 p-12">
          <div className="relative inline-block">
            <Users2 className="h-24 w-24 text-muted-foreground animate-bounce-slow" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary rounded-full animate-ping" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary rounded-full" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Your Tree is Empty</h3>
            <p className="text-base text-muted-foreground max-w-md">
              Start building your family legacy by adding your first family member.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <FamilyTreeNode member={member} allMembers={members} />
          </div>
        ))}
      </div>
    </div>
  );
}
