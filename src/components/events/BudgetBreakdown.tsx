'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Edit2, Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  name: string;
  perPerson: number; // in cents
  emoji: string;
  color: string;
}

interface BudgetBreakdownProps {
  eventId: string;
  totalPerPerson: number; // in cents (e.g., 10000 for R100)
  attendeeCount: number;
  onBreakdownChange?: (breakdown: BudgetCategory[]) => void;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 'meals', name: 'Meals', perPerson: 8000, emoji: '🍖', color: 'from-orange-400 to-red-400' },
  { id: 'snacks', name: 'Snacks', perPerson: 2000, emoji: '🍿', color: 'from-amber-400 to-orange-400' },
  { id: 'drinks', name: 'Drinks', perPerson: 0, emoji: '🥤', color: 'from-blue-400 to-cyan-400' },
  { id: 'setup', name: 'Setup/Decor', perPerson: 0, emoji: '✨', color: 'from-pink-400 to-purple-400' },
];

export default function BudgetBreakdown({
  eventId,
  totalPerPerson,
  attendeeCount,
  onBreakdownChange,
}: BudgetBreakdownProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>(DEFAULT_CATEGORIES);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize edit values
    const initial: Record<string, number> = {};
    categories.forEach(cat => {
      initial[cat.id] = cat.perPerson / 100;
    });
    setEditValues(initial);
  }, [categories]);

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.perPerson, 0);
  const remaining = totalPerPerson - totalAllocated;
  const totalBudget = totalPerPerson * attendeeCount;

  const handleSaveBreakdown = () => {
    const updated = categories.map(cat => ({
      ...cat,
      perPerson: Math.round(editValues[cat.id] * 100),
    }));
    setCategories(updated);
    onBreakdownChange?.(updated);
    setIsEditing(false);
  };

  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Budget Breakdown
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Customize
          </button>
        )}
      </div>

      {/* Per Person Allocation */}
      <div className="space-y-3">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-3 bg-card border-2 border-primary/20 rounded-2xl p-4">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-1">
                <label className="text-xs font-semibold text-foreground/60 block">
                  {cat.emoji} {cat.name} (per person)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground/50">R</span>
                  <input
                    type="number"
                    step="0.50"
                    value={editValues[cat.id]}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        [cat.id]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}

            {/* Remaining Alert */}
            {remaining !== 0 && (
              <div className="p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                <p className="text-xs font-bold">
                  {remaining > 0
                    ? `📍 ${formatCurrency(remaining)} unallocated per person`
                    : `⚠️ Budget exceeded by ${formatCurrency(Math.abs(remaining))} per person`}
                </p>
              </div>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveBreakdown}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save Breakdown
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-colors flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // View Mode - Categories
          <div className="grid grid-cols-2 gap-3">
            {categories
              .filter(cat => cat.perPerson > 0)
              .map((cat, idx) => {
                const percentage = totalPerPerson > 0 ? (cat.perPerson / totalPerPerson) * 100 : 0;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-xl bg-gradient-to-br ${cat.color} text-white p-4 text-center`}
                  >
                    <p className="text-2xl mb-1">{cat.emoji}</p>
                    <p className="text-xs font-semibold opacity-90">{cat.name}</p>
                    <p className="text-lg font-bold mt-2">{formatCurrency(cat.perPerson)}</p>
                    <p className="text-xs opacity-75">{percentage.toFixed(0)}% of budget</p>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Totals Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-muted border-2 border-border overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead className="bg-foreground/5">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 font-bold text-foreground/70">Category</th>
              <th className="text-right px-4 py-2 font-bold text-foreground/70">Per Person</th>
              <th className="text-right px-4 py-2 font-bold text-foreground/70">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-2">
                  <span className="mr-2">{cat.emoji}</span>
                  <span className="font-semibold">{cat.name}</span>
                </td>
                <td className="text-right px-4 py-2 font-bold text-primary">
                  {formatCurrency(cat.perPerson)}
                </td>
                <td className="text-right px-4 py-2 font-bold text-accent">
                  {formatCurrency(cat.perPerson * attendeeCount)}
                </td>
              </tr>
            ))}
            <tr className="bg-primary/10 font-bold">
              <td className="px-4 py-2">TOTAL</td>
              <td className="text-right px-4 py-2 text-primary">
                {formatCurrency(totalAllocated)}
              </td>
              <td className="text-right px-4 py-2 text-primary">
                {formatCurrency(totalAllocated * attendeeCount)}
              </td>
            </tr>
          </tbody>
        </table>
      </motion.div>

      {/* Info */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-3">
        <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2">
          💡 Total Budget Summary
        </p>
        <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <p>
            • <span className="font-bold">{attendeeCount} people</span> × {formatCurrency(totalAllocated)} per person
          </p>
          <p>
            • <span className="font-bold">Total Event Budget: {formatCurrency(totalAllocated * attendeeCount)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
