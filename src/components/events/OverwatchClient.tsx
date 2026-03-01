'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { getPusherClient } from '@/lib/pusher/client';
import { getEventLocations } from '@/app/actions/events';
import { sendAdminPing } from '@/app/actions/events';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

interface ConvoyMember {
  id?: string;
  userId: string;
  userName: string;
  latitude: string;
  longitude: string;
  speed?: number;
  speedKmh?: number;
  batteryLevel?: number | null;
  isCharging?: boolean | null;
  lastPingAt?: string | null;
  accuracy?: number;
}

interface OverwatchClientProps {
  event: any;
  currentUser: { uid: string; name: string; role?: string };
}

// ── Battery helpers ────────────────────────────────────────────────────────
function batteryColor(level: number | null | undefined) {
  if (level == null) return '#6b7280'; // gray / unknown
  if (level > 50) return '#00FF66';    // green
  if (level > 20) return '#facc15';    // yellow
  return '#ef4444';                    // red
}

function batteryRingClass(level: number | null | undefined) {
  if (level == null) return '';
  if (level <= 20) return 'animate-pulse';
  return '';
}

// ── Stale ping check ───────────────────────────────────────────────────────
function minutesAgo(isoString: string | null | undefined): number {
  if (!isoString) return 999;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60_000);
}

// ── Custom avatar marker ───────────────────────────────────────────────────
function buildAvatarIcon(member: ConvoyMember): DivIcon {
  const level = member.batteryLevel;
  const ring = batteryColor(level);
  const stale = minutesAgo(member.lastPingAt) >= 5;
  const speed = member.speedKmh ?? member.speed ?? 0;
  const initials = member.userName.slice(0, 2).toUpperCase();
  const opacity = stale ? 0.45 : 1;

  const html = `
    <div style="position:relative;opacity:${opacity}">
      <!-- Battery ring -->
      <div style="
        width:46px;height:46px;border-radius:50%;
        border:3px solid ${ring};
        box-shadow:0 0 10px ${ring}88;
        display:flex;align-items:center;justify-content:center;
        background:#1A1A1A;
        ${level != null && level <= 20 ? 'animation:pulse 1s infinite;' : ''}
      ">
        <span style="font-size:14px;font-weight:bold;color:white;">${initials}</span>
      </div>
      <!-- Speed badge -->
      <div style="
        position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
        background:#0d0d0d;border:1px solid #00F0FF;border-radius:8px;
        padding:1px 5px;font-size:10px;color:#00F0FF;white-space:nowrap;font-weight:bold;
      ">${speed === 0 ? '🛑 0' : `${speed}`} km/h</div>
      ${stale ? `<div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:#dc2626;border-radius:6px;padding:1px 5px;font-size:9px;color:white;white-space:nowrap;">Signal Lost</div>` : ''}
    </div>`;

  return new DivIcon({ html, className: '', iconSize: [46, 60], iconAnchor: [23, 60], popupAnchor: [0, -60] });
}

// ── Sorting helpers ────────────────────────────────────────────────────────
function isCritical(m: ConvoyMember) {
  const lowBattery = m.batteryLevel != null && m.batteryLevel < 15;
  const staleStopped = (m.speedKmh ?? m.speed ?? 0) === 0 && minutesAgo(m.lastPingAt) >= 10;
  return lowBattery || staleStopped;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function OverwatchClient({ event, currentUser }: OverwatchClientProps) {
  const [members, setMembers] = useState<ConvoyMember[]>([]);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const { toast } = useToast();

  const eventCenter: [number, number] = event.coordinates
    ? [event.coordinates.lat, event.coordinates.lng]
    : [-33.9249, 18.4241];

  const loadMembers = useCallback(async () => {
    const result = await getEventLocations(event.id);
    if (result.success) setMembers(result.locations as ConvoyMember[]);
  }, [event.id]);

  // Initial load
  useEffect(() => { loadMembers(); }, [loadMembers]);

  // Pusher real-time
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`presence-event-${event.id}`);
    channel.bind('location-update', (data: ConvoyMember) => {
      setMembers(prev => {
        const idx = prev.findIndex(m => m.userId === data.userId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [...prev, data];
      });
    });
    return () => { channel.unbind_all(); channel.unsubscribe(); };
  }, [event.id]);

  const handlePing = async (member: ConvoyMember) => {
    setPingingId(member.userId);
    const res = await sendAdminPing(member.userId, currentUser.name, event.id);
    setPingingId(null);
    toast({
      title: res.success ? `📡 Ping sent to ${member.userName}` : 'Ping failed',
      description: res.success ? 'They will receive an alert notification.' : String((res as any).error),
      variant: res.success ? 'default' : 'destructive',
    });
  };

  // Sort: critical first
  const sorted = [...members].sort((a, b) => Number(isCritical(b)) - Number(isCritical(a)));

  return (
    <div className="w-screen h-screen flex bg-[#0d0d0d] overflow-hidden">

      {/* ── Full-screen map ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={eventCenter}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* Dark tactical tile layer */}
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Event centre pin */}
          {event.coordinates && (
            <CircleMarker
              center={[event.coordinates.lat, event.coordinates.lng]}
              radius={10}
              pathOptions={{ color: '#00F0FF', fillColor: '#00F0FF', fillOpacity: 0.4 }}
            >
              <Popup>📍 {event.title}</Popup>
            </CircleMarker>
          )}

          {/* Convoy member markers */}
          {members.map(m => {
            const lat = parseFloat(m.latitude);
            const lng = parseFloat(m.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            const stale = minutesAgo(m.lastPingAt) >= 5;
            const ago = minutesAgo(m.lastPingAt);
            return (
              <Marker key={m.userId} position={[lat, lng]} icon={buildAvatarIcon(m)}>
                <Popup>
                  <div className="min-w-[180px] text-sm">
                    <p className="font-bold text-base mb-1">{m.userName}</p>
                    <p>🔋 Battery: {m.batteryLevel != null ? `${m.batteryLevel}%` : 'Unknown'} {m.isCharging ? '⚡' : ''}</p>
                    <p>🚗 Speed: {m.speedKmh ?? m.speed ?? 0} km/h</p>
                    {stale && <p className="text-red-500 font-semibold mt-1">⚠️ Signal lost {ago}m ago</p>}
                    <button
                      className="mt-2 w-full bg-[#00F0FF] text-black font-bold py-1 rounded text-xs hover:bg-cyan-300 transition"
                      onClick={() => handlePing(m)}
                    >
                      📡 Admin Ping
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map header overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-[#0d0d0d]/80 backdrop-blur border border-[#00F0FF] rounded-xl px-4 py-2">
          <div className="text-[#00F0FF] font-extrabold text-lg tracking-widest">⚡ OVERWATCH</div>
          <div className="text-gray-400 text-xs">{event.title} · {members.length} active</div>
        </div>
      </div>

      {/* ── Convoy Status Sidebar ── */}
      <div className="w-80 bg-[#111]/90 backdrop-blur-md border-l border-[#00F0FF]/30 flex flex-col">
        <div className="p-4 border-b border-[#00F0FF]/30">
          <h2 className="text-[#00FF66] font-extrabold text-sm tracking-widest uppercase">Convoy Status</h2>
          <p className="text-gray-500 text-xs mt-0.5">Sorted: critical first</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
          {sorted.length === 0 && (
            <div className="p-6 text-center text-gray-600 text-sm">
              No active trackers.<br />Members need to enable tracking.
            </div>
          )}
          {sorted.map(m => {
            const critical = isCritical(m);
            const stale = minutesAgo(m.lastPingAt) >= 5;
            const ago = minutesAgo(m.lastPingAt);
            const speed = m.speedKmh ?? m.speed ?? 0;
            const ring = batteryColor(m.batteryLevel);

            return (
              <div
                key={m.userId}
                className={`p-4 transition-colors ${critical ? 'bg-red-950/30' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Mini avatar ring */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 border-2 ${batteryRingClass(m.batteryLevel)}`}
                      style={{ borderColor: ring, boxShadow: `0 0 8px ${ring}66`, background: '#1A1A1A' }}
                    >
                      {m.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${critical ? 'text-red-400' : 'text-white'}`}>
                        {m.userName}
                        {critical && <span className="ml-1 text-red-400">⚠️</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        🔋 {m.batteryLevel != null ? `${m.batteryLevel}%` : '?'}{m.isCharging ? ' ⚡' : ''} · {speed === 0 ? '🛑 Idle' : `🚗 ${speed} km/h`}
                      </p>
                      {stale && (
                        <p className="text-xs text-red-400 font-semibold">Signal lost {ago}m ago</p>
                      )}
                    </div>
                  </div>
                  {/* Ping button */}
                  <button
                    disabled={pingingId === m.userId}
                    onClick={() => handlePing(m)}
                    className="shrink-0 text-xs px-2 py-1 rounded-lg border border-[#00F0FF] text-[#00F0FF]
                               hover:bg-[#00F0FF]/10 transition disabled:opacity-40"
                  >
                    {pingingId === m.userId ? '…' : '📡 Ping'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 space-y-1">
          <div className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] mt-1 shrink-0" /> <span>&gt;50% battery</span>
            <span className="w-2 h-2 rounded-full bg-yellow-400 mt-1 shrink-0" /> <span>20–50%</span>
            <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" /> <span>&lt;20%</span>
          </div>
          <p className="text-gray-700">⚠️ = &lt;15% battery or idle &gt;10m</p>
        </div>
      </div>
    </div>
  );
}
