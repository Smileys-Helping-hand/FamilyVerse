"use client";

import { FamilyTree } from "@/components/family/FamilyTree";
import { AddMember } from "@/components/family/AddMember";

export default function TreePage() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 z-10">
        <AddMember />
      </div>
      <FamilyTree />
    </div>
  );
}
