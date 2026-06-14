'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Check,
  MapPin,
  X,
  Filter,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getShoppingList,
  addShoppingItem,
  claimShoppingItem,
  markItemBought,
  deleteShoppingItem,
  getEventSuggestions,
  acceptSuggestion,
  getShopRecommendations,
} from '@/app/actions/event-budget';

const CATEGORIES = [
  { id: 'DRINKS', label: '🥤 Drinks', color: 'from-blue-400 to-cyan-400' },
  { id: 'SNACKS', label: '🍿 Snacks', color: 'from-amber-400 to-orange-400' },
  { id: 'FOOD', label: '🍖 Food', color: 'from-red-400 to-orange-400' },
  { id: 'EQUIPMENT', label: '⚙️ Equipment', color: 'from-slate-400 to-gray-400' },
  { id: 'DECORATION', label: '✨ Decoration', color: 'from-pink-400 to-purple-400' },
  { id: 'OTHER', label: '📦 Other', color: 'from-emerald-400 to-teal-400' },
];

interface ShoppingListProps {
  eventId: string;
  currentUserId: string;
  currentUserName: string;
  eventLocation?: { lat: number; lng: number };
}

export default function ShoppingList({
  eventId,
  currentUserId,
  currentUserName,
  eventLocation,
}: ShoppingListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'OTHER',
    quantity: '',
    estimatedPrice: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const [itemsRes, suggestionsRes, shopsRes] = await Promise.all([
      getShoppingList(eventId),
      getEventSuggestions(eventId),
      getShopRecommendations(eventId),
    ]);

    if (itemsRes.success) setItems(itemsRes.items);
    if (suggestionsRes.success) setSuggestions(suggestionsRes.suggestions);
    if (shopsRes.success) setShops(shopsRes.shops);
    setLoading(false);
  };

  const handleAddItem = async () => {
    if (!formData.itemName.trim() || !formData.quantity.trim()) return;

    const res = await addShoppingItem(
      eventId,
      formData.itemName,
      formData.category,
      formData.quantity,
      formData.estimatedPrice ? Math.round(Number(formData.estimatedPrice) * 100) : undefined,
      undefined,
      formData.notes
    );

    if (res.success) {
      setItems([...items, res.item]);
      setFormData({
        itemName: '',
        category: 'OTHER',
        quantity: '',
        estimatedPrice: '',
        notes: '',
      });
      setShowAddItem(false);
    }
  };

  const handleClaimItem = async (itemId: string) => {
    const res = await claimShoppingItem(itemId, currentUserId, currentUserName);
    if (res.success) {
      setItems(items.map(i => i.id === itemId ? res.item : i));
    }
  };

  const handleMarkBought = async (itemId: string) => {
    const res = await markItemBought(itemId);
    if (res.success) {
      setItems(items.map(i => i.id === itemId ? res.item : i));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteShoppingItem(itemId);
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleAcceptSuggestion = async (suggestionId: string, suggestion: any) => {
    await acceptSuggestion(suggestionId, true);

    // Add to shopping list
    await addShoppingItem(
      eventId,
      suggestion.title,
      suggestion.category || 'OTHER',
      suggestion.quantity || '1',
      suggestion.estimatedPrice
    );

    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    loadData();
  };

  const filteredItems = filterCategory
    ? items.filter(i => i.category === filterCategory)
    : items;

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.color || 'from-slate-400 to-slate-400';
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return '—';
    return `R${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with stats */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Shopping List</h3>
            <p className="text-sm text-foreground/60">
              {items.length} items • {items.filter(i => i.status === 'BOUGHT').length} bought
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-gradient-to-br from-amber-100/50 dark:from-amber-900/20 via-orange-100/30 dark:via-orange-900/10 to-yellow-100/50 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800/50 p-4"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mb-3">
                  ✨ AI Suggestions ({suggestions.length})
                </p>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-white/5"
                    >
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                          {s.title}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          {s.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptSuggestion(s.id, s)}
                        className="ml-2 px-2 py-1 rounded text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                      >
                        Add
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all',
              filterCategory === null
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground/70 hover:bg-muted/80'
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                filterCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white`
                  : 'bg-muted text-foreground/70 hover:bg-muted/80'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
            const category = CATEGORIES.find(c => c.id === item.category);
            const isClaimed = item.status === 'CLAIMED' || item.status === 'BOUGHT';
            const isBought = item.status === 'BOUGHT';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'rounded-xl p-4 border-2 transition-all',
                  isBought
                    ? 'bg-secondary/10 border-secondary/20 opacity-60'
                    : 'bg-card border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleMarkBought(item.id)}
                    className={cn(
                      'mt-1 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                      isBought
                        ? 'bg-secondary'
                        : 'bg-muted hover:bg-muted/80 border border-border'
                    )}
                  >
                    {isBought && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-sm font-bold">{item.itemName}</span>
                      {category && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground/70">
                          {category.label.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-foreground/60 mb-2">
                      <span>📦 {item.quantity}</span>
                      {item.estimatedPrice && (
                        <span>💰 {formatPrice(item.estimatedPrice)}</span>
                      )}
                      {item.suggestedShop && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.suggestedShop}
                        </span>
                      )}
                    </div>

                    {item.assignedToUserName && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                          {item.assignedToUserName[0]}
                        </div>
                        <span className="font-medium text-foreground/70">
                          {item.assignedToUserName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {!isClaimed && (
                      <button
                        onClick={() => handleClaimItem(item.id)}
                        className="px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Claim
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 rounded text-xs font-bold bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200/50 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && items.length === 0 && !showAddItem && (
          <div className="rounded-2xl bg-muted/50 border-2 border-dashed border-border p-8 text-center">
            <ShoppingCart className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground/70 mb-1">
              No items on the list yet
            </p>
            <p className="text-xs text-foreground/50 mb-4">
              Add items or accept AI suggestions
            </p>
          </div>
        )}
      </div>

      {/* Add Item Form */}
      {!showAddItem ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddItem(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Item
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-card border-2 border-primary/20 p-4 space-y-4"
        >
          <h4 className="font-bold text-sm">Add Shopping Item</h4>

          <div>
            <label className="text-xs font-semibold text-foreground/60 mb-2 block">
              What to buy?
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="e.g., Coca-Cola 2L"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground/60 mb-2 block">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground/60 mb-2 block">
                Quantity
              </label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 3, 2L"
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/60 mb-2 block">
              Est. Price (R)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedPrice}
              onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
              placeholder="Optional"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddItem(false);
                setFormData({
                  itemName: '',
                  category: 'OTHER',
                  quantity: '',
                  estimatedPrice: '',
                  notes: '',
                });
              }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
