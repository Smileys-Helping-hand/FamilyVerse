'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { Smile, Rocket } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from 'emoji-picker-react';

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div className="w-[350px] h-[450px] bg-slate-800 animate-pulse rounded-lg" />,
});

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  showSendButton?: boolean;
  autoFocus?: boolean;
}

const QUICK_REACTIONS = [
  { emoji: '🏎️', label: 'Race Car' },
  { emoji: '🏁', label: 'Checkered Flag' },
  { emoji: '🚨', label: 'Safety Car' },
  { emoji: '🥩', label: 'Braai' },
  { emoji: '🍺', label: 'Drink' },
  { emoji: '😱', label: 'Shock' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👀', label: 'Eyes' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🍻', label: 'Cheers' },
  { emoji: '🚩', label: 'Flag' },
  { emoji: '💰', label: 'Money' },
];

const PLACEHOLDERS = [
  "Trash talk goes here...",
  "Bet 100 on Uncle Mo?",
  "Who's winning this?",
  "Time for another round?",
  "Challenge accepted!",
  "Let's goooo! 🏎️",
];

export const RichInput = forwardRef<HTMLTextAreaElement, RichInputProps>(
  (
    {
      value,
      onChange,
      onSend,
      placeholder,
      disabled = false,
      maxLength = 500,
      className,
      showSendButton = true,
      autoFocus = false,
    },
    ref
  ) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholder || PLACEHOLDERS[0]);
    const [showSendAnimation, setShowSendAnimation] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);

    // Rotate placeholder text
    useEffect(() => {
      if (!placeholder) {
        const interval = setInterval(() => {
          setCurrentPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
        }, 5000);
        return () => clearInterval(interval);
      }
    }, [placeholder]);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }, [value]);

    // Close emoji picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          showEmojiPicker &&
          emojiButtonRef.current &&
          !emojiButtonRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('.EmojiPickerReact')
        ) {
          setShowEmojiPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    const handleQuickReact = (emoji: string) => {
      onChange(value + emoji);
      textareaRef.current?.focus();
    };

    const handleEmojiSelect = (emojiData: any) => {
      onChange(value + emojiData.emoji);
      setShowEmojiPicker(false);
      textareaRef.current?.focus();
    };

    const handleSend = () => {
      if (!value.trim() || disabled) return;
      setShowSendAnimation(true);
      setTimeout(() => setShowSendAnimation(false), 600);
      onSend?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className={cn('relative space-y-2', className)}>
        {/* Quick Reactions Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          {QUICK_REACTIONS.map(({ emoji, label }) => (
            <motion.button
              key={emoji}
              onClick={() => handleQuickReact(emoji)}
              disabled={disabled}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex-shrink-0 text-2xl w-10 h-10 rounded-lg',
                'bg-gradient-to-br from-slate-700 to-slate-800',
                'hover:from-purple-600 hover:to-pink-600',
                'transition-all duration-200',
                'border border-slate-600 hover:border-purple-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg hover:shadow-purple-500/50'
              )}
              title={label}
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Input Container */}
        <div
          className={cn(
            'relative rounded-xl overflow-hidden',
            'bg-gradient-to-br from-slate-800/50 to-slate-900/50',
            'backdrop-blur-md border border-slate-700/50',
            'shadow-xl transition-all duration-200',
            'focus-within:border-purple-500/50 focus-within:shadow-purple-500/20'
          )}
        >
          {/* Main Textarea */}
          <textarea
            ref={(node) => {
              (textareaRef as any).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={currentPlaceholder}
            autoFocus={autoFocus}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-24 resize-none',
              'bg-transparent text-white placeholder:text-slate-400',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'font-medium'
            )}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
          />

          {/* Bottom Bar with Emoji & Send */}
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {/* Character Count */}
            {value.length > maxLength * 0.8 && (
              <span
                className={cn(
                  'text-xs font-medium px-2',
                  value.length >= maxLength ? 'text-red-400' : 'text-slate-400'
                )}
              >
                {value.length}/{maxLength}
              </span>
            )}

            {/* Emoji Picker Button */}
            <button
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-slate-700/50',
                showEmojiPicker && 'bg-purple-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              title="Add emoji"
            >
              <Smile className="w-5 h-5 text-slate-400 hover:text-purple-400 transition-colors" />
            </button>

            {/* Send Button */}
            {showSendButton && (
              <div className="relative">
                <AnimatePresence>
                  {showSendAnimation && (
                    <>
                      {/* Particle effects */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: Math.cos((i * Math.PI) / 4) * 30,
                            y: Math.sin((i * Math.PI) / 4) * 30,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleSend}
                  disabled={disabled || !value.trim()}
                  size="sm"
                  className={cn(
                    'relative bg-gradient-to-r from-purple-500 to-pink-500',
                    'hover:from-purple-600 hover:to-pink-600',
                    'shadow-lg hover:shadow-purple-500/50',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <motion.div
                    animate={
                      showSendAnimation
                        ? {
                            x: [0, 10, -5, 0],
                            rotate: [0, -15, 5, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6 }}
                  >
                    <Rocket className="w-4 h-4" />
                  </motion.div>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Emoji Picker Popover */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 z-50 shadow-2xl rounded-lg overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                theme={Theme.DARK}
                width={350}
                height={450}
                searchPlaceHolder="Search emojis..."
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

RichInput.displayName = 'RichInput';
