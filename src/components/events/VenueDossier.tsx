'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Cloud, Droplets, Loader2, Lightbulb, Search, X, Sparkles } from 'lucide-react';
import type { WeatherDay } from '@/app/api/venue-intel/route';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

async function geocodeSearch(query: string): Promise<MapboxFeature[]> {
  if (!MAPBOX_TOKEN || query.length < 3) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&types=place,address,poi`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.features ?? [];
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

export interface VenueSelection {
  name: string;
  lat: number;
  lng: number;
}

interface VenueDossierProps {
  initialVenue?: string;
  eventType: string;
  onVenueChange?: (venue: VenueSelection | null) => void;
  className?: string;
}

const WMO_EMOJI: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌊', 71: '🌨️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export function VenueDossier({ initialVenue = '', eventType, onVenueChange, className }: VenueDossierProps) {
  const [query, setQuery] = useState(initialVenue);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [selected, setSelected] = useState<VenueSelection | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialVenue && !MAPBOX_TOKEN) {
      // No token — skip geocoding, use location name as-is
    }
  }, [initialVenue]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await geocodeSearch(value);
      setSuggestions(results);
      setSearching(false);
    }, 350);
  };

  const selectVenue = useCallback(
    async (feature: MapboxFeature) => {
      const [lng, lat] = feature.center;
      const venue: VenueSelection = { name: feature.place_name, lat, lng };
      setSelected(venue);
      setQuery(feature.place_name);
      setSuggestions([]);
      onVenueChange?.(venue);

      setLoading(true);
      setWeather([]);
      setActivities([]);
      try {
        const res = await fetch('/api/venue-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, eventType, venue: feature.place_name }),
        });
        if (res.ok) {
          const data = await res.json();
          setWeather(data.weather ?? []);
          setActivities(data.suggestions ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [eventType, onVenueChange],
  );

  const clearVenue = () => {
    setQuery('');
    setSelected(null);
    setSuggestions([]);
    setWeather([]);
    setActivities([]);
    onVenueChange?.(null);
    inputRef.current?.focus();
  };

  const hasDossier = selected && (weather.length > 0 || activities.length > 0 || loading);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {searching
            ? <Loader2 className="h-4 w-4 text-foreground/35 animate-spin" />
            : <Search className="h-4 w-4 text-foreground/35" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search for a venue or location..."
          className={cn(
            'w-full rounded-xl border-2 bg-card px-4 py-2.5 pl-10 text-sm',
            'placeholder:text-foreground/35 focus:outline-none transition-colors',
            selected
              ? 'border-secondary/40 pr-9'
              : 'border-border focus:border-primary/40',
          )}
        />
        {selected && (
          <button
            type="button"
            onClick={clearVenue}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground transition-colors"
            aria-label="Clear venue"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-2xl border-2 border-border bg-card shadow-xl overflow-hidden">
            {suggestions.map((feat) => (
              <li key={feat.id}>
                <button
                  type="button"
                  onClick={() => selectVenue(feat)}
                  className="flex items-start gap-2.5 w-full px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{feat.place_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border text-foreground/50 text-sm">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          Researching venue details...
        </div>
      )}

      {/* Venue Dossier card */}
      {hasDossier && !loading && (
        <div className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-muted/40">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Venue Insights
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* 5-day weather */}
            {weather.length > 0 && (
              <div>
                <p className="text-xs text-foreground/45 font-semibold mb-2 flex items-center gap-1">
                  <Cloud className="h-3 w-3" /> 5-Day Forecast
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {weather.map((day) => (
                    <div
                      key={day.date}
                      className="shrink-0 flex flex-col items-center gap-1 bg-muted/60 border border-border rounded-xl px-3 py-2.5 min-w-[72px]"
                    >
                      <span className="text-[10px] text-foreground/40 font-medium">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                      <span className="text-xl leading-none">{WMO_EMOJI[day.weatherCode] ?? '🌡️'}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-semibold">{day.maxTemp}°</span>
                        <span className="text-foreground/40">{day.minTemp}°</span>
                      </div>
                      {day.precipMm > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px] text-sky-500">
                          <Droplets className="h-2.5 w-2.5" />
                          {day.precipMm}mm
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI activity suggestions */}
            {activities.length > 0 && (
              <div>
                <p className="text-xs text-foreground/45 font-semibold mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-accent" /> Suggested Activities
                </p>
                <ul className="space-y-1.5">
                  {activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
