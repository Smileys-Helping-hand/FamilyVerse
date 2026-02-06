"use client";

import { useState } from "react";
import { ChildProfile } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (child: Omit<ChildProfile, "id" | "createdAt">) => void;
}

export function AddChildDialog({ open, onOpenChange, onAdd }: AddChildDialogProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !birthDate) return;

    onAdd({
      name,
      age: parseInt(age),
      birthDate: {
        seconds: new Date(birthDate).getTime() / 1000,
        nanoseconds: 0,
      } as any,
      parentId: "", // Will be set by the parent component
    });

    // Reset form
    setName("");
    setAge("");
    setBirthDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] animate-in fade-in zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-sky-600" />
            <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Add Child Profile</span>
          </DialogTitle>
          <DialogDescription>
            Create a profile to set up parental controls for your child
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <Label htmlFor="name">Child's Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              required
              className="border-2 focus:border-sky-400 transition-colors"
            />
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: "100ms" }}>
            <Label htmlFor="birthdate">Birth Date</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                // Calculate age
                const today = new Date();
                const birth = new Date(e.target.value);
                const calculatedAge = today.getFullYear() - birth.getFullYear();
                setAge(calculatedAge.toString());
              }}
              required
              className="border-2 focus:border-sky-400 transition-colors"
            />
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: "200ms" }}>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Calculated from birth date"
              min="1"
              max="18"
              required
              readOnly
              className="border-2 bg-gray-50"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms" }}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-gray-100 transition-colors">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
