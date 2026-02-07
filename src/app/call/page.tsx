'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Room, createLocalTracks } from 'livekit-client';

export default function CallPage() {
  const params = useSearchParams();
  const serverId = params.get('serverId');
  const channelId = params.get('channelId');
  const callType = params.get('type') || 'voice';

  const [status, setStatus] = useState('Idle');
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState(0);

  const roomRef = useRef<Room | null>(null);

  const roomName = useMemo(() => {
    if (!serverId || !channelId) return null;
    return `${serverId}:${channelId}`;
  }, [serverId, channelId]);

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const joinCall = async () => {
    if (!roomName) {
      setError('Missing serverId or channelId');
      return;
    }

    setError(null);
    setStatus('Requesting token...');

    try {
      const response = await fetch('/api/call/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, channelId, type: callType }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to create token');
      }

      const payload = await response.json();
      const { token, url } = payload as { token: string; url: string };

      setStatus('Connecting...');
      const room = new Room();
      roomRef.current = room;

      room
        .on('participantConnected', () => setParticipants(room.participants.size))
        .on('participantDisconnected', () => setParticipants(room.participants.size));

      await room.connect(url, token);

      setStatus('Publishing tracks...');
      const localTracks = await createLocalTracks({
        audio: true,
        video: callType === 'video',
      });

      localTracks.forEach((track) => room.localParticipant.publishTrack(track));

      setConnected(true);
      setParticipants(room.participants.size);
      setStatus('Connected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join call';
      setError(message);
      setStatus('Error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0a1a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Live Call</h1>
        <p className="text-sm text-gray-400 mt-1">
          Room: {roomName || 'Unknown'} • Type: {callType}
        </p>

        <div className="mt-6 space-y-2 text-sm">
          <p>Status: {status}</p>
          <p>Participants: {participants + (connected ? 1 : 0)}</p>
          {error && <p className="text-red-400">{error}</p>}
        </div>

        <button
          onClick={joinCall}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold"
        >
          {connected ? 'Rejoin Call' : 'Join Call'}
        </button>
      </div>
    </div>
  );
}
