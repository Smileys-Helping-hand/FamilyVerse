import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

export function MiniMapPreview({ lat, lng }: { lat: number; lng: number }) {
  if (typeof window === "undefined") return null;
  return (
    <div className="w-full h-48 rounded-lg overflow-hidden border mt-4">
      <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
