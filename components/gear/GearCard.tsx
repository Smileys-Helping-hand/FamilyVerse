import React from "react";

interface GearCardProps {
  itemName: string;
  category: string;
  owned: boolean;
  autoVolunteer: boolean;
  onToggleOwned: () => void;
  onToggleAutoVolunteer: () => void;
}

export default function GearCard({ itemName, category, owned, autoVolunteer, onToggleOwned, onToggleAutoVolunteer }: GearCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-between p-4 rounded-xl shadow-lg transition-all cursor-pointer ${owned ? "bg-gradient-to-br from-purple-500 via-orange-400 to-yellow-300 border-2 border-purple-500" : "bg-gray-100 border border-gray-300 opacity-60"}`}
      onClick={onToggleOwned}
      title={owned ? "Click to mark as unowned" : "Click to mark as owned"}
    >
      <div className="text-lg font-bold mb-2">{itemName}</div>
      <div className="text-xs text-gray-500 mb-4">{category}</div>
      {owned && (
        <div className="w-full flex flex-col items-center mt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoVolunteer}
              onClick={e => e.stopPropagation()}
              onChange={onToggleAutoVolunteer}
              className="accent-purple-500"
            />
            ⚡ Auto-Volunteer Me
            <span className="ml-1 text-xs text-gray-400" title="If the group needs this item, automatically assign it to me so we don't have to ask.">🛈</span>
          </label>
        </div>
      )}
      {!owned && (
        <div className="text-xs text-gray-400 mt-2">I don't have this.</div>
      )}
    </div>
  );
}
