'use client';

import { useEffect } from 'react';

/**
 * PWA Head Component
 * Handles service worker registration and PWA setup
 */
export function PWAHead() {
  useEffect(() => {
    // Register service worker only in production with valid SSL
    if (typeof window !== 'undefined' && 
        'serviceWorker' in navigator && 
        window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Service worker registered successfully
          registration.update();
        })
        .catch((error) => {
          // Silently fail if SSL issues or registration problems
          // The app works fine without service worker
          if (process.env.NODE_ENV === 'development') {
            console.error('Service Worker registration failed:', error);
          }
        });
    }
  }, []);

  return null;
}
