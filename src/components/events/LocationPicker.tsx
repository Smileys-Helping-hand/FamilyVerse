'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Location {
  id: string;
  name: string;
  type: 'park' | 'venue' | 'restaurant';
  emoji: string;
  description: string;
  parking: string;
}

const SAMPLE_PARKS = [
  { id: 'jnb-zoo', name: 'Johannesburg Zoo', type: 'park' as const, emoji: '🦁', description: 'Wildlife & nature experience', parking: 'Ample parking available' },
  { id: 'mel-koppes', name: 'Melville Koppies', type: 'park' as const, emoji: '⛰️', description: 'Hiking & scenic views', parking: 'Limited street parking' },
  { id: 'wits-campus', name: 'Wits Campus Gardens', type: 'park' as const, emoji: '🌺', description: 'Beautiful gardens & grounds', parking: 'Campus parking available' },
  { id: 'lion-park', name: 'Lion Park', type: 'park' as const, emoji: '🦁', description: 'Game reserve & picnic areas', parking: 'Free parking' },
  { id: 'hartbeespoort', name: 'Hartbeespoort Dam', type: 'venue' as const, emoji: '💧', description: 'Water activities & relaxation', parking: 'Large parking areas' },
  { id: 'cradle', name: 'Cradle of Humankind', type: 'venue' as const, emoji: '🏔️', description: 'UNESCO world heritage site', parking: 'Parking at various points' },
];

export default function LocationPicker({
  value,
  onChange,
  locationType,
}: {
  value: string;
  onChange: (location: string) => void;
  locationType: string;
}) {
  const [search, setSearch] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    // Simulate search with delay
    const timer = setTimeout(() => {
      const results = SAMPLE_PARKS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (location: Location) => {
    onChange(location.name);
    setSearch(location.name);
    setShowSuggestions(false);
  };

  if (locationType === 'home') {
    return (
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); }}
        placeholder="e.g. My Home, 123 Main Street"
        className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
      />
    );
  }

  return (
    <div className="space-y-3 relative">
      <div className="relative">
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search parks, venues... (e.g. Johannesburg Zoo, Melville Koppies)"
          className="w-full rounded-xl bg-card border-2 border-border px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors pr-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-foreground/40" />
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-primary/30 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div className="max-h-96 overflow-y-auto space-y-1 p-2">
            {suggestions.map((location, i) => (
              <motion.button
                key={location.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelect(location)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span className="text-2xl shrink-0">{location.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{location.name}</p>
                  <p className="text-xs text-foreground/50 truncate">{location.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                    <MapPin className="w-3 h-3" />
                    <span>{location.parking}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick suggestions if empty search */}
      {!search && showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-primary/30 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="w-3 h-3" />
              Popular Spots
            </div>
          </div>
          <div className="space-y-1 p-2">
            {SAMPLE_PARKS.slice(0, 6).map((location, i) => (
              <motion.button
                key={location.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelect(location)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span className="text-2xl shrink-0">{location.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{location.name}</p>
                  <p className="text-xs text-foreground/50 truncate">{location.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
