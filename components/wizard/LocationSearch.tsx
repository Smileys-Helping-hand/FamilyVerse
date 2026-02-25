"use client";
import React, { useState, useEffect } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function LocationSearch({ onSelect }: { onSelect: (result: { place: string; lat: number; lng: number }) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`
    )
      .then((res) => res.json())
      .then((data) => setResults(data.features || []));
  }, [debouncedQuery]);

  return (
    <div className="relative w-full">
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
        <span className="mr-2 text-gray-400">🔍</span>
        <input
          className="flex-1 outline-none bg-transparent"
          placeholder="Search for a location..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </div>
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border rounded-lg shadow-lg mt-2 z-10">
          {results.map((feature) => (
            <button
              key={feature.id}
              className="block w-full text-left px-4 py-2 hover:bg-blue-100"
              onMouseDown={() => {
                onSelect({
                  place: feature.place_name,
                  lat: feature.center[1],
                  lng: feature.center[0]
                });
                setQuery(feature.place_name);
                setShowDropdown(false);
              }}
            >
              {feature.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
