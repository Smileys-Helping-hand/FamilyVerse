/**
 * Audio Context Initialization Utility
 * 
 * Browsers block auto-playing audio. This utility initializes
 * the audio context on the first user interaction to "unlock"
 * audio playback for the entire session.
 */

let audioInitialized = false;

/**
 * Initialize audio context on first user interaction
 * Call this on login, join party, or any first button click
 */
export const initializeAudio = () => {
  if (audioInitialized || typeof window === 'undefined') return;

  try {
    // Create a silent audio element and play it
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    audio.volume = 0.01;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioInitialized = true;
        })
        .catch(() => {
          // Audio initialization failed, continue without audio
        });
    }

    // Initialize Web Audio API context if available
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      ctx.resume();
    }
  } catch (error) {
    // Audio initialization failed, continue without audio
  }
};

/**
 * Play a sound effect
 */
export const playSound = (soundPath: string, volume: number = 0.5) => {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play().catch(() => {
      // Sound playback failed, continue silently
    });
  } catch (error) {
    // Failed to play sound, continue silently
  }
};

/**
 * Preload sound files
 */
export const preloadSounds = (soundPaths: string[]) => {
  if (typeof window === 'undefined') return;

  soundPaths.forEach((path) => {
    const audio = new Audio();
    audio.src = path;
    audio.preload = 'auto';
  });
};

/**
 * Check if audio is initialized
 */
export const isAudioInitialized = () => audioInitialized;
