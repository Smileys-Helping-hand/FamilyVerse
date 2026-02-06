'use client';

import { useEffect } from 'react';

/**
 * PWA Head Component
 * Handles service worker registration and PWA setup
 */
export function PWAHead() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // Check for updates
          registration.update();
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }

    // Log PWA status
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 Running as installed PWA');
    }
  }, []);

  return null;
}
