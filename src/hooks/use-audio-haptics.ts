'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Audio & Haptic Hooks for Party OS
 * 
 * Mobile browsers block auto-playing audio until a user gesture "unlocks" the audio context.
 * These hooks provide a way to unlock audio on first interaction and play sounds afterwards.
 */

// =============================================================================
// Audio Unlock Hook
// =============================================================================
let audioContext: AudioContext | null = null;
let audioUnlocked = false;

/**
 * Hook to manage audio unlocking and playback.
 * Call `unlockAudio()` on first user interaction (e.g., "Join Party" button).
 * Then use `playSound(url)` for subsequent sound effects.
 */
export function useAudio() {
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map());

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContext && typeof window !== 'undefined') {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  }, []);

  // Unlock audio on user gesture
  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) return true;

    try {
      const ctx = getAudioContext();
      if (!ctx) return false;

      // Resume context if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Play a silent buffer to unlock
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      audioUnlocked = true;
      console.log('🔊 Audio unlocked');
      return true;
    } catch (error) {
      console.warn('Audio unlock failed:', error);
      return false;
    }
  }, [getAudioContext]);

  // Load and cache audio buffer
  const loadAudio = useCallback(async (url: string): Promise<AudioBuffer | null> => {
    const cached = audioCache.current.get(url);
    if (cached) return cached;

    try {
      const ctx = getAudioContext();
      if (!ctx) return null;

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      audioCache.current.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn('Failed to load audio:', url, error);
      return null;
    }
  }, [getAudioContext]);

  // Play a sound
  const playSound = useCallback(async (url: string, volume = 1.0) => {
    try {
      const ctx = getAudioContext();
      if (!ctx || !audioUnlocked) return;

      const buffer = await loadAudio(url);
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Add volume control
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, [getAudioContext, loadAudio]);

  // Preload common sounds
  const preloadSounds = useCallback(async (urls: string[]) => {
    await Promise.all(urls.map(loadAudio));
  }, [loadAudio]);

  return {
    unlockAudio,
    playSound,
    preloadSounds,
    isUnlocked: () => audioUnlocked,
  };
}

// =============================================================================
// Haptic Feedback Hook
// =============================================================================

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const hapticPatterns: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [50],
  heavy: [100],
  success: [50, 50, 100],
  error: [100, 50, 100, 50, 100],
  warning: [50, 100, 50],
};

/**
 * Hook for haptic feedback.
 * Uses navigator.vibrate on supported devices.
 * Falls back silently on unsupported devices (iOS).
 */
export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: HapticPattern | number | number[]) => {
    if (!isSupported) return false;

    try {
      if (typeof pattern === 'string') {
        return navigator.vibrate(hapticPatterns[pattern] || [50]);
      }
      return navigator.vibrate(pattern);
    } catch (error) {
      // Silently fail - haptics are optional
      return false;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore
    }
  }, [isSupported]);

  return {
    vibrate,
    stop,
    isSupported,
  };
}

// =============================================================================
// Combined Party Feedback Hook
// =============================================================================

/**
 * Combined hook for party-specific audio + haptic feedback events.
 */
export function usePartyFeedback() {
  const audio = useAudio();
  const haptics = useHaptics();

  // Unlock everything on first interaction
  const unlock = useCallback(async () => {
    return audio.unlockAudio();
  }, [audio]);

  // Event-specific feedback
  const onWin = useCallback(async () => {
    haptics.vibrate('success');
    await audio.playSound('/sounds/winner.mp3');
  }, [audio, haptics]);

  const onLose = useCallback(async () => {
    haptics.vibrate('error');
    await audio.playSound('/sounds/lose.mp3');
  }, [audio, haptics]);

  const onReveal = useCallback(async () => {
    haptics.vibrate('heavy');
    await audio.playSound('/sounds/reveal.mp3');
  }, [audio, haptics]);

  const onTap = useCallback(() => {
    haptics.vibrate('light');
  }, [haptics]);

  const onNotification = useCallback(async () => {
    haptics.vibrate('medium');
    await audio.playSound('/sounds/notification.mp3');
  }, [audio, haptics]);

  const onRaceFinish = useCallback(async () => {
    haptics.vibrate([100, 50, 100, 50, 200]);
    await audio.playSound('/sounds/winner.mp3');
  }, [audio, haptics]);

  return {
    unlock,
    onWin,
    onLose,
    onReveal,
    onTap,
    onNotification,
    onRaceFinish,
    audio,
    haptics,
  };
}

// =============================================================================
// Audio Unlock Wrapper Component
// =============================================================================

interface AudioUnlockWrapperProps {
  children: React.ReactNode;
  onUnlock?: () => void;
}

/**
 * Wrapper component that unlocks audio on first click.
 * Wrap your "Join Party" button with this component.
 */
export function AudioUnlockWrapper({ children, onUnlock }: AudioUnlockWrapperProps) {
  const { unlockAudio, preloadSounds } = useAudio();

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds([
      '/sounds/winner.mp3',
      '/sounds/unlock.mp3',
    ]);
  }, [preloadSounds]);

  const handleClick = async (e: React.MouseEvent) => {
    await unlockAudio();
    onUnlock?.();
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}
