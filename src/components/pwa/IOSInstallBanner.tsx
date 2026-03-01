'use client';

import { useState, useEffect } from 'react';

/**
 * Shows a stylish bottom banner on iPhone/iPad Safari telling users
 * to add the app to their Home Screen so push notifications work.
 * Automatically hides once they are using the app in standalone mode (installed).
 */
export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = ('standalone' in navigator) && (navigator as any).standalone === true;
    const dismissed = sessionStorage.getItem('gg-ios-banner-dismissed');

    if (isIOS && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 safe-area-pb">
      <div className="bg-[#1A1A1A] border border-[#00F0FF] rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        {/* Gang Gear icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-[#00FF66] flex items-center justify-center text-black font-extrabold text-lg shrink-0">
          GG
        </div>
        <div className="flex-1 text-sm">
          <p className="font-bold text-[#00F0FF] mb-1">iPhone User? Install Gang Gear 📲</p>
          <p className="text-gray-300 leading-snug">
            To get live alerts, tap the{' '}
            <span className="inline-flex items-center gap-0.5 font-semibold text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L8 6H11V14H13V6H16L12 2ZM4 17V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V17H18V20H6V17H4Z" />
              </svg>
              Share
            </span>{' '}
            button below, then select{' '}
            <strong className="text-[#00FF66]">"Add to Home Screen"</strong>.
            Open the app from your home screen for full functionality!
          </p>
        </div>
        <button
          className="text-gray-500 hover:text-white text-xl shrink-0 leading-none mt-1"
          onClick={() => {
            sessionStorage.setItem('gg-ios-banner-dismissed', '1');
            setShow(false);
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
