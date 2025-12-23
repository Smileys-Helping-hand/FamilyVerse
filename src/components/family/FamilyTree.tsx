"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { FamilyMember } from "@/types";
import { FamilyTreeNode } from "./FamilyTreeNode";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2 } from "lucide-react";

export function FamilyTree() {
  const { family } = useAuth();
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
  }, [family?.id]);

  if (loading) {
    return (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg shadow-sm bg-card">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
  }
  
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)] rounded-lg border-2 border-dashed">
        <Users2 className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Your Tree is Empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add your first family member to get started.</p>
      </div>
    )
  }

  return (
    <div className="mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => (
          <FamilyTreeNode key={member.id} member={member} allMembers={members} />
        ))}
      </div>
    </div>
  );
}
