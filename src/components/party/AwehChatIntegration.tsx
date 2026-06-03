'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Users, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AwehChatFABProps {
  eventId?: string;
  eventName?: string;
}

export function AwehChatFAB({ eventId, eventName }: AwehChatFABProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/moswords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_group_message',
          message: eventName ? `[${eventName}] ${message}` : message,
          eventId,
        }),
      });
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch {}
    setSending(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-80 rounded-2xl border border-border shadow-2xl glass overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-bold text-sm">AwehChat</span>
                {eventName && <span className="text-xs text-white/70 truncate max-w-[120px]">· {eventName}</span>}
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-foreground/60">
                Send a message to your group via MosWords / AwehChat.
              </p>

              {sent && (
                <div className="rounded-xl bg-secondary/10 border border-secondary/20 px-3 py-2 text-sm text-secondary font-medium">
                  ✓ Message sent to AwehChat!
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl bg-muted border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => window.open('https://www.awehchat.co.za', '_blank')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open AwehChat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
          'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
          open ? 'rotate-180 scale-90' : 'hover:scale-110 animate-pulse-warm',
        )}
        aria-label="Open AwehChat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}

interface TrashTalkButtonProps {
  driverName: string;
  driverId?: string;
}

export function TrashTalkButton({ driverName, driverId }: TrashTalkButtonProps) {
  const handleTrashTalk = () => {
    const url = driverId
      ? `https://www.awehchat.co.za/chat?user=${encodeURIComponent(driverId)}`
      : 'https://www.awehchat.co.za';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleTrashTalk}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      AwehChat
    </button>
  );
}

interface EventChatButtonProps {
  eventId: string;
  eventName: string;
  guestPhones?: string[];
}

export function EventChatButton({ eventId, eventName, guestPhones = [] }: EventChatButtonProps) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const sendInvite = async () => {
    setSending(true);
    try {
      await fetch('/api/moswords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_event_invite',
          eventId,
          eventName,
          phones: guestPhones,
          rsvpUrl: `${window.location.origin}/events/${eventId}`,
        }),
      });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {}
    setSending(false);
  };

  return (
    <button
      onClick={sendInvite}
      disabled={sending || done}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
        done
          ? 'bg-secondary/15 text-secondary border border-secondary/20'
          : 'bg-sky-500 text-white hover:bg-sky-600 shadow-md',
      )}
    >
      <MessageCircle className="w-4 h-4" />
      {done ? '✓ Sent via AwehChat' : sending ? 'Sending...' : 'Invite via AwehChat'}
    </button>
  );
}
