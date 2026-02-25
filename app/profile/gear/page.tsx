"use client";
import React, { useEffect, useState } from "react";
import GearCard from "../../../components/gear/GearCard";
import { getUserGear, toggleGearItem } from "../../../actions/inventory";
import { useOptimistic } from "react";

const GEAR_CATEGORIES = [
  {
    name: "The Braai Master",
    icon: "🥩",
    items: ["Grid", "Charcoal", "Tongs", "Cooler Box"],
  },
  {
    name: "The Beach Bum",
    icon: "🏖️",
    items: ["Gazebo", "Beach Chairs", "Umbrella", "Volleyball"],
  },
  {
    name: "The Vibes",
    icon: "🎵",
    items: ["Bluetooth Speaker", "Power Bank", "Extension Lead"],
  },
  {
    name: "The Guardian",
    icon: "🚸",
    items: ["First Aid Kit", "Sunblock", "Wet Wipes"],
  },
];

export default function GearBagPage() {
  // TODO: Replace with real userId from auth
  const userId = "demo-user";
  const [gear, setGear] = useState<{ itemName: string; autoVolunteer: boolean; category: string }[]>([]);
  const [optimisticGear, setOptimisticGear] = useOptimistic(gear);
  const [activeCategory, setActiveCategory] = useState(GEAR_CATEGORIES[0].name);
  const [showModal, setShowModal] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [customCategory, setCustomCategory] = useState("Cooking");

  useEffect(() => {
    getUserGear(userId).then((data) => {
      setGear(data);
      setOptimisticGear(data);
    });
  }, [userId]);

  function handleToggle(itemName: string, category: string) {
    const owned = optimisticGear.some((g) => g.itemName === itemName);
    setOptimisticGear((prev) => {
      if (owned) return prev.filter((g) => g.itemName !== itemName);
      return [...prev, { itemName, autoVolunteer: false, category }];
    });
    toggleGearItem({ userId, itemName, isOwned: !owned, autoVolunteer: false });
  }

  function handleToggleAuto(itemName: string) {
    setOptimisticGear((prev) =>
      prev.map((g) =>
        g.itemName === itemName ? { ...g, autoVolunteer: !g.autoVolunteer } : g
      )
    );
    const gearItem = optimisticGear.find((g) => g.itemName === itemName);
    if (gearItem)
      toggleGearItem({ userId, itemName, isOwned: true, autoVolunteer: !gearItem.autoVolunteer });
  }

  function handleAddCustom() {
    if (!customItem.trim()) return;
    setOptimisticGear((prev) => [
      ...prev,
      { itemName: customItem.trim(), autoVolunteer: false, category: customCategory },
    ]);
    toggleGearItem({ userId, itemName: customItem.trim(), isOwned: true, autoVolunteer: false });
    setShowModal(false);
    setCustomItem("");
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">🎒 My Gear Bag</h1>
      <div className="text-gray-600 mb-6">Select the items you own. We'll automatically assign them to you when the squad needs them.</div>
      <div className="flex gap-2 mb-6">
        {GEAR_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`px-4 py-2 rounded-lg font-semibold ${activeCategory === cat.name ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            <span className="mr-1">{cat.icon}</span>{cat.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        {GEAR_CATEGORIES.find((cat) => cat.name === activeCategory)?.items.map((item) => {
          const owned = optimisticGear.some((g) => g.itemName === item);
          const auto = optimisticGear.find((g) => g.itemName === item)?.autoVolunteer || false;
          return (
            <GearCard
              key={item}
              itemName={item}
              category={activeCategory}
              owned={owned}
              autoVolunteer={auto}
              onToggleOwned={() => handleToggle(item, activeCategory)}
              onToggleAutoVolunteer={() => handleToggleAuto(item)}
            />
          );
        })}
      </div>
      {/* Custom Loot Section */}
      <div className="mb-8">
        <button
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold w-full"
          onClick={() => setShowModal(true)}
        >
          + Add Custom Gear
        </button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Custom Gear</h2>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="e.g. Spikeball Set, Bouncy Ball Gun"
              value={customItem}
              onChange={e => setCustomItem(e.target.value)}
            />
            <label className="block mb-2 font-semibold">Category</label>
            <select
              className="border rounded px-3 py-2 w-full mb-4"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
            >
              <option>Cooking</option>
              <option>Fun</option>
              <option>Tech</option>
              <option>Utility</option>
            </select>
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex-1"
                onClick={handleAddCustom}
              >
                Add
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Gear Cards */}
      <div className="grid grid-cols-2 gap-6">
        {optimisticGear.filter(g => !GEAR_CATEGORIES.some(cat => cat.items.includes(g.itemName))).map((g) => (
          <GearCard
            key={g.itemName}
            itemName={g.itemName}
            category={g.category || "Custom"}
            owned={true}
            autoVolunteer={g.autoVolunteer}
            onToggleOwned={() => handleToggle(g.itemName, g.category || "Custom")}
            onToggleAutoVolunteer={() => handleToggleAuto(g.itemName)}
          />
        ))}
      </div>
    </main>
  );
}
