"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MemberForm } from "./MemberForm";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export function AddMember() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Family Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new member. You can link them to existing family members.
          </DialogDescription>
        </DialogHeader>
        <MemberForm setDialogOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
