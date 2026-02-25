import React, { useState } from "react";

// Minimal Mapbox Places API autocomplete (client-side fetch)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function VenueAutocomplete({ onSelect }: { onSelect: (place: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchPlaces(q: string) {
    setLoading(true);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setResults(data.features || []);
    setLoading(false);
  }

  return (
    <div className="w-full">
      <input
        className="w-full border rounded-lg px-4 py-2 mb-2"
        placeholder="Search for a venue or place..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          if (e.target.value.length > 2) searchPlaces(e.target.value);
          else setResults([]);
        }}
      />
      {loading && <div className="text-sm text-gray-500">Searching...</div>}
      <ul className="bg-white border rounded-lg shadow max-h-56 overflow-auto">
        {results.map((place) => (
          <li
            key={place.id}
            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            onClick={() => {
              onSelect(place);
              setQuery(place.place_name);
              setResults([]);
            }}
          >
            <div className="font-semibold">{place.text}</div>
            <div className="text-xs text-gray-500">{place.place_name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
