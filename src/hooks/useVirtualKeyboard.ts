'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface UseVirtualKeyboardOptions {
  mode?: 'full' | 'numpad';
  autoShow?: boolean;
}

export function useVirtualKeyboard(options: UseVirtualKeyboardOptions = {}) {
  const { mode = 'full', autoShow = true } = options;
  const pathname = usePathname();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'full' | 'numpad'>(mode);
  const [inputValue, setInputValue] = useState('');

  // Detect if we're in TV/Kiosk mode based on URL
  const isKioskMode =
    pathname?.includes('/tv') ||
    pathname?.includes('/kiosk') ||
    pathname?.includes('/admin/control');

  // Auto-show keyboard when input is focused in kiosk mode
  useEffect(() => {
    if (!isKioskMode || !autoShow) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        // Determine mode based on input type
        if (
          target instanceof HTMLInputElement &&
          (target.type === 'number' || target.inputMode === 'numeric')
        ) {
          setKeyboardMode('numpad');
        } else {
          setKeyboardMode('full');
        }
        setShowKeyboard(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Don't hide immediately - let user interact with keyboard
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (
          activeElement?.tagName !== 'INPUT' &&
          activeElement?.tagName !== 'TEXTAREA'
        ) {
          setShowKeyboard(false);
        }
      }, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isKioskMode, autoShow]);

  const toggleKeyboard = () => setShowKeyboard(!showKeyboard);
  const hideKeyboard = () => setShowKeyboard(false);
  const showKeyboardWithMode = (newMode: 'full' | 'numpad') => {
    setKeyboardMode(newMode);
    setShowKeyboard(true);
  };

  return {
    showKeyboard,
    keyboardMode,
    isKioskMode,
    inputValue,
    setInputValue,
    toggleKeyboard,
    hideKeyboard,
    showKeyboardWithMode,
    setKeyboardMode,
  };
}
