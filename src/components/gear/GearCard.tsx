import React from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface GearCardProps {
  itemName: string;
  category: string;
  owned: boolean;
  autoVolunteer: boolean;
  onToggleOwned: () => void;
  onToggleAutoVolunteer: () => void;
}

export default function GearCard({
  itemName,
  owned,
  autoVolunteer,
  onToggleOwned,
  onToggleAutoVolunteer,
}: GearCardProps) {
  return (
    <div
      onClick={onToggleOwned}
      title={owned ? "Click to remove from bag" : "Click to add to bag"}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none",
        owned
          ? "bg-[#00FF66]/5 border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.1)]"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-600 opacity-60 hover:opacity-80",
      )}
    >
      <p className={cn("text-sm font-semibold leading-tight", owned ? "text-zinc-100" : "text-zinc-400")}>
        {itemName}
      </p>

      {owned ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleAutoVolunteer(); }}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-all duration-150 w-fit",
            autoVolunteer
              ? "bg-[#00FF66]/10 border-[#00FF66]/50 text-[#00FF66]"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
          )}
          title="Quartermaster will auto-assign this to you"
        >
          <Zap className="h-3 w-3 shrink-0" />
          Auto-Volunteer
        </button>
      ) : (
        <span className="text-xs text-zinc-600">Not in bag</span>
      )}
    </div>
  );
}
