'use client';

import { useState, useEffect, useOptimistic, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserGear, toggleGearItem } from '@/actions/inventory';
import GearCard from '@/components/gear/GearCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

// ── Preset gear categories ─────────────────────────────────────────────────
const CATEGORIES: { emoji: string; label: string; items: string[] }[] = [
  {
    emoji: '🥩',
    label: 'The Braai Master',
    items: ['Braai Grid', 'Charcoal', 'Tongs', 'Cooler Box', 'Fire Starter', 'Braai Stand'],
  },
  {
    emoji: '🏖️',
    label: 'The Beach Bum',
    items: ['Gazebo', 'Beach Chairs', 'Beach Umbrella', 'Volleyball', 'Towels', 'Sunblock'],
  },
  {
    emoji: '🎵',
    label: 'The Vibes',
    items: ['Bluetooth Speaker', 'Power Bank', 'Extension Lead', 'Fairy Lights', 'Portable Projector'],
  },
  {
    emoji: '🚸',
    label: 'The Guardian',
    items: ['First Aid Kit', 'Wet Wipes', 'Baby Bag', 'Fold-up Pram', 'Sun Tent for Kids'],
  },
  {
    emoji: '🧰',
    label: 'The Utility Belt',
    items: ['Folding Table', 'Camping Stove', 'Gas Canister', 'Rope / Bungee Cords', 'Garbage Bags'],
  },
];

interface GearItem { itemName: string; autoVolunteer: boolean }

export default function GearBagPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gear, setGear] = useState<GearItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Utility');
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!user?.uid) return;
    getUserGear(user.uid).then((rows) =>
      setGear(rows.map(r => ({ itemName: r.itemName, autoVolunteer: r.autoVolunteer })))
    );
  }, [user?.uid]);

  const isOwned = (name: string) => gear.some(g => g.itemName === name);
  const isAutoVolunteer = (name: string) => gear.find(g => g.itemName === name)?.autoVolunteer ?? false;

  const handleToggleOwned = (itemName: string) => {
    if (!user?.uid) return;
    const owned = isOwned(itemName);
    const newOwned = !owned;

    // Optimistic update
    startTransition(() => {
      setGear(prev =>
        newOwned
          ? [...prev, { itemName, autoVolunteer: false }]
          : prev.filter(g => g.itemName !== itemName)
      );
    });

    toggleGearItem({ userId: user.uid, itemName, isOwned: newOwned, autoVolunteer: false }).catch(() => {
      toast({ title: 'Error', description: 'Could not save gear preference.', variant: 'destructive' });
      // Revert
      setGear(prev =>
        newOwned
          ? prev.filter(g => g.itemName !== itemName)
          : [...prev, { itemName, autoVolunteer: false }]
      );
    });
  };

  const handleToggleAutoVolunteer = (itemName: string) => {
    if (!user?.uid) return;
    const current = isAutoVolunteer(itemName);
    const next = !current;

    startTransition(() => {
      setGear(prev => prev.map(g => g.itemName === itemName ? { ...g, autoVolunteer: next } : g));
    });

    toggleGearItem({ userId: user.uid, itemName, isOwned: true, autoVolunteer: next }).catch(() => {
      toast({ title: 'Error', description: 'Could not update auto-volunteer.', variant: 'destructive' });
      setGear(prev => prev.map(g => g.itemName === itemName ? { ...g, autoVolunteer: current } : g));
    });
  };

  const handleAddCustom = async () => {
    if (!user?.uid || !customName.trim()) return;
    const name = customName.trim();
    setGear(prev => [...prev, { itemName: name, autoVolunteer: false }]);
    await toggleGearItem({ userId: user.uid, itemName: name, isOwned: true, autoVolunteer: false });
    setCustomName('');
    setModalOpen(false);
    toast({ title: '✅ Loot added!', description: `${name} added to your Gear Bag.` });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">🎒 My Gear Bag</h1>
        <p className="text-gray-400 max-w-xl">
          Select the items you own. We'll automatically assign them to you when the squad needs them.
          Toggle <span className="text-[#00FF66] font-semibold">⚡ Auto-Volunteer</span> if you want the
          Quartermaster to assign you without asking.
        </p>
      </div>

      {/* Owned count */}
      <div className="mb-6 flex items-center gap-3">
        <div className="px-4 py-2 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-xl text-[#00FF66] font-bold">
          {gear.length} item{gear.length !== 1 ? 's' : ''} in your bag
        </div>
        <div className="px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-[#00F0FF] font-bold">
          {gear.filter(g => g.autoVolunteer).length} auto-volunteered
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => (
        <section key={cat.label} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            {cat.emoji} {cat.label}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cat.items.map(item => (
              <GearCard
                key={item}
                itemName={item}
                category={cat.label}
                owned={isOwned(item)}
                autoVolunteer={isAutoVolunteer(item)}
                onToggleOwned={() => handleToggleOwned(item)}
                onToggleAutoVolunteer={() => handleToggleAutoVolunteer(item)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Custom items owned by the user that aren't in presets */}
      {gear.filter(g => !CATEGORIES.flatMap(c => c.items).includes(g.itemName)).length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">🛠️ Custom Loot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gear
              .filter(g => !CATEGORIES.flatMap(c => c.items).includes(g.itemName))
              .map(g => (
                <GearCard
                  key={g.itemName}
                  itemName={g.itemName}
                  category="Custom"
                  owned={true}
                  autoVolunteer={g.autoVolunteer}
                  onToggleOwned={() => handleToggleOwned(g.itemName)}
                  onToggleAutoVolunteer={() => handleToggleAutoVolunteer(g.itemName)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Add Custom Gear */}
      <div className="mt-8 flex justify-center">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#1A1A1A] border border-[#00FF66] text-[#00FF66] hover:bg-[#00FF66] hover:text-black transition-all">
              <Plus className="w-4 h-4" />
              + Add Custom Gear
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border border-[#00F0FF] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#00F0FF]">Add Custom Loot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Item Name</label>
                <Input
                  placeholder="e.g. Spikeball Set, Massive Potjie Pot..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                  className="bg-[#0d0d0d] border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Category</label>
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger className="bg-[#0d0d0d] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] text-white border-gray-700">
                    {['Cooking', 'Fun', 'Tech', 'Utility', 'Other'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-[#00FF66] text-black font-bold hover:bg-[#00cc52]"
                onClick={handleAddCustom}
                disabled={!customName.trim()}
              >
                Add to Gear Bag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
