'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA Install Prompt
 * Shows a beautiful install prompt for users to add the app to their home screen
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    registerServiceWorker();

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    // Check if already installed
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOSDevice = /iphone|ipad|ipod/.test(userAgent);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSince = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
      
      // Don't show again for 7 days
      if (daysSince < 7) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay (5 seconds) so user can see the app first
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if app gets installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    // iOS Safari does not fire beforeinstallprompt, show a manual prompt
    if (isiOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="p-4 shadow-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Smartphone className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Install PartyOS</h3>
                {deferredPrompt ? (
                  <>
                    <p className="text-sm text-white/90 mb-3">
                      Add to your home screen for quick access and offline use!
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleInstall}
                        size="sm"
                        className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Install
                      </Button>
                      <Button
                        onClick={handleDismiss}
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Not Now
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white/90 mb-3">
                      On iPhone, tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDismiss}
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Got it
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Service Worker Registration
 * Registers the service worker for PWA functionality
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // Service worker registration failed, app continues to work
        });
    });
  }
}
