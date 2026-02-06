'use client';

import { useEffect, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  onChange: (input: string) => void;
  onKeyPress?: (button: string) => void;
  inputName?: string;
  mode?: 'full' | 'numpad';
  show: boolean;
  onClose?: () => void;
  theme?: 'dark' | 'neon';
}

export function VirtualKeyboard({
  onChange,
  onKeyPress,
  inputName = 'default',
  mode = 'full',
  show,
  onClose,
  theme = 'neon',
}: VirtualKeyboardProps) {
  const keyboardRef = useRef<any>(null);

  const layouts = {
    full: {
      default: [
        '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
        '{tab} q w e r t y u i o p [ ] \\',
        "{lock} a s d f g h j k l ; ' {enter}",
        '{shift} z x c v b n m , . / {shift}',
        '.com @ {space}',
      ],
      shift: [
        '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
        '{tab} Q W E R T Y U I O P { } |',
        '{lock} A S D F G H J K L : " {enter}',
        '{shift} Z X C V B N M < > ? {shift}',
        '.com @ {space}',
      ],
    },
    numpad: {
      default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0 {enter}'],
    },
  };

  const display = {
    '{bksp}': '⌫',
    '{enter}': mode === 'numpad' ? '✓' : '↵',
    '{shift}': '⇧',
    '{tab}': '→',
    '{lock}': '⇪',
    '{space}': '___________',
  };

  const handleKeyPress = (button: string) => {
    onKeyPress?.(button);

    // Special handling for certain keys
    if (button === '{enter}' && mode === 'numpad') {
      onClose?.();
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'border-t shadow-2xl',
          theme === 'neon'
            ? 'bg-gradient-to-b from-slate-900 via-purple-900/50 to-slate-900 border-purple-500/50'
            : 'bg-slate-900 border-slate-700'
        )}
      >
        {/* Close Button */}
        {onClose && (
          <div className="flex justify-end p-2">
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-slate-800',
                theme === 'neon' && 'text-purple-400 hover:text-purple-300'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Keyboard Container */}
        <div
          className={cn(
            'p-4',
            mode === 'numpad' ? 'max-w-md mx-auto' : 'max-w-4xl mx-auto'
          )}
        >
          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            layoutName="default"
            layout={mode === 'full' ? layouts.full : layouts.numpad}
            display={display}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            inputName={inputName}
            theme={`hg-theme-default ${theme === 'neon' ? 'neon-keyboard' : 'dark-keyboard'}`}
            buttonTheme={
              mode === 'numpad'
                ? [
                    {
                      class: 'numpad-key',
                      buttons: '1 2 3 4 5 6 7 8 9 0',
                    },
                    {
                      class: 'numpad-action',
                      buttons: '{bksp} {enter}',
                    },
                  ]
                : undefined
            }
          />
        </div>

        <style jsx global>{`
          /* Neon Theme */
          .neon-keyboard.hg-theme-default {
            background: transparent;
            padding: 0;
          }

          .neon-keyboard .hg-button {
            height: 60px;
            min-height: 60px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 2px solid #3b82f6;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            border-radius: 12px;
            margin: 4px;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 
                        inset 0 0 10px rgba(59, 130, 246, 0.1);
            transition: all 0.2s ease;
          }

          .neon-keyboard .hg-button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            border-color: #60a5fa;
            box-shadow: 0 0 30px rgba(96, 165, 250, 0.6),
                        inset 0 0 15px rgba(96, 165, 250, 0.2);
            transform: translateY(-2px);
          }

          .neon-keyboard .hg-button:active {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            border-color: #a78bfa;
            box-shadow: 0 0 40px rgba(167, 139, 250, 0.8),
                        inset 0 0 20px rgba(167, 139, 250, 0.3);
            transform: scale(0.95);
          }

          .neon-keyboard .hg-button-space {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            border-color: #a78bfa;
          }

          .neon-keyboard .hg-button-enter {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-color: #34d399;
          }

          .neon-keyboard .hg-button-bksp {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-color: #f87171;
          }

          /* Numpad specific styles */
          .neon-keyboard .numpad-key {
            height: 80px;
            font-size: 32px;
            font-weight: 700;
          }

          .neon-keyboard .numpad-action {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            border-color: #a78bfa;
          }

          /* Dark Theme */
          .dark-keyboard.hg-theme-default {
            background: #1e293b;
            padding: 10px;
            border-radius: 8px;
          }

          .dark-keyboard .hg-button {
            height: 50px;
            background: #334155;
            border: 1px solid #475569;
            color: #f1f5f9;
            font-size: 16px;
            border-radius: 8px;
            margin: 3px;
          }

          .dark-keyboard .hg-button:hover {
            background: #475569;
            border-color: #64748b;
          }

          .dark-keyboard .hg-button:active {
            background: #1e293b;
            border-color: #94a3b8;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .neon-keyboard .hg-button {
              height: 50px;
              min-height: 50px;
              font-size: 16px;
              margin: 2px;
            }

            .neon-keyboard .numpad-key {
              height: 70px;
              font-size: 28px;
            }
          }

          @media (max-width: 480px) {
            .neon-keyboard .hg-button {
              height: 45px;
              min-height: 45px;
              font-size: 14px;
              margin: 1px;
            }

            .neon-keyboard .numpad-key {
              height: 60px;
              font-size: 24px;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
