"use client";
import React, { useEffect, useState } from "react";

// Common group items for checklist
const COMMON_ITEMS = [
  "Cooler Box",
  "Braai Grid",
  "Camping Chairs",
  "Gazebo",
  "Portable Speaker",
  "Folding Table",
  "Soccer Ball",
  "Blanket",
  "Power Bank",
  "First Aid Kit",
];

export default function MyGearBagPage() {
  const [inventory, setInventory] = useState<{ itemName: string; autoVolunteer: boolean }[]>([]);
  const [customItem, setCustomItem] = useState("");

  // TODO: Load inventory from API
  useEffect(() => {
    // Fetch user's inventory from backend
    // setInventory(...)
  }, []);

  function toggleItem(itemName: string) {
    setInventory((inv) => {
      const exists = inv.find((i) => i.itemName === itemName);
      if (exists) {
        // Remove
        return inv.filter((i) => i.itemName !== itemName);
      } else {
        // Add
        return [...inv, { itemName, autoVolunteer: false }];
      }
    });
  }

  function toggleAutoVolunteer(itemName: string) {
    setInventory((inv) =>
      inv.map((i) =>
        i.itemName === itemName ? { ...i, autoVolunteer: !i.autoVolunteer } : i
      )
    );
  }

  function addCustomItem() {
    if (!customItem.trim()) return;
    setInventory((inv) => [...inv, { itemName: customItem.trim(), autoVolunteer: false }]);
    setCustomItem("");
  }

  // TODO: Save inventory to API

  return (
    <main className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">My Gear Bag</h1>
      <div className="space-y-4">
        {COMMON_ITEMS.map((item) => {
          const owned = inventory.some((i) => i.itemName === item);
          const auto = inventory.find((i) => i.itemName === item)?.autoVolunteer;
          return (
            <div key={item} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
              <input
                type="checkbox"
                checked={owned}
                onChange={() => toggleItem(item)}
                className="w-5 h-5"
                id={item}
              />
              <label htmlFor={item} className="flex-1 cursor-pointer">
                {item}
              </label>
              {owned && (
                <>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={auto}
                      onChange={() => toggleAutoVolunteer(item)}
                      className="w-4 h-4"
                    />
                    Auto-volunteer me
                  </label>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Add Custom Item</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 flex-1"
            placeholder="e.g. Spikeball Set, Bouncy Ball Gun"
            value={customItem}
            onChange={e => setCustomItem(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addCustomItem(); }}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={addCustomItem}
          >
            Add
          </button>
        </div>
      </div>
      <div className="mt-8">
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold w-full">
          Save My Gear
        </button>
      </div>
    </main>
  );
}
