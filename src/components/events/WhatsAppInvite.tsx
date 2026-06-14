'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  Copy,
  CheckCircle2,
  MessageCircle,
  QrCode,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppInviteProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  guestCount?: number;
  budgetAmount?: number;
}

export default function WhatsAppInvite({
  eventId,
  eventTitle,
  eventDate,
  guestCount = 0,
  budgetAmount = 1000,
}: WhatsAppInviteProps) {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build magic link/invite URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://familyverse.app';
  const inviteUrl = `${baseUrl}/events/${eventId}/join`;

  // WhatsApp message template
  const whatsappMessage = `🎉 **${eventTitle}** is being planned on FamilyVerse!

👥 We have ${guestCount} girls coming
💰 Budget: R${(budgetAmount / 100).toFixed(2)} per person

📍 What's included:
• Budget tracking (no confusion!)
• Smart shopping list with AI suggestions
• Task delegation (who's buying what)
• Real-time updates

👉 Join here: ${inviteUrl}

Setup takes 30 seconds. See you there! 🎊`;

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: 'Opening WhatsApp', description: 'Share with your group!' });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: 'Link copied!', description: 'Paste it anywhere' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(whatsappMessage);
    toast({ title: 'Message copied!', description: 'Paste in your WhatsApp group' });
  };

  return (
    <div className="space-y-4">
      {/* Main WhatsApp Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleWhatsAppShare}
        className="w-full p-4 rounded-2xl bg-[#25D366] hover:bg-[#20c351] text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all"
      >
        <MessageCircle className="w-6 h-6" />
        Share Event on WhatsApp
      </motion.button>

      {/* Secondary Options */}
      <div className="grid grid-cols-2 gap-3">
        {/* Copy Link Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            copied
              ? 'bg-secondary text-white'
              : 'bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </motion.button>

        {/* QR Code Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQR(!showQR)}
          className="p-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border-2 border-accent/20 transition-all"
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </motion.button>
      </div>

      {/* QR Code Display */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-card border-2 border-border p-6 flex flex-col items-center gap-4"
        >
          <p className="text-sm font-semibold text-foreground/70">Scan to join</p>
          <div className="bg-white p-4 rounded-xl">
            <div className="w-48 h-48 bg-slate-200 rounded flex items-center justify-center text-sm text-slate-600">
              📱 QR Code
              <br />
              (Generated on share)
            </div>
          </div>
          <p className="text-xs text-foreground/50 text-center">
            Cousins can scan this QR code or click the link to join instantly
          </p>
        </motion.div>
      )}

      {/* Message Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-muted/50 border-2 border-border p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground/70">Message Preview</p>
          <button
            onClick={handleCopyMessage}
            className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Copy Message
          </button>
        </div>
        <div className="text-xs text-foreground/60 bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 leading-relaxed">
          {whatsappMessage.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </motion.div>

      {/* Info Box */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-3">
        <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2">
          💡 Pro Tip
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>✓ Share to WhatsApp Group chat</li>
          <li>✓ Cousins click link to join instantly</li>
          <li>✓ They see budget & can add contributions</li>
          <li>✓ Real-time updates for everyone</li>
        </ul>
      </div>
    </div>
  );
}
