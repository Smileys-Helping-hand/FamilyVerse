'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contributor {
  id: string;
  name: string;
  amount: number;
  paymentMethod: string;
  status: 'paid' | 'pending';
  paidAt?: Date;
}

interface PaymentStatusTrackerProps {
  contributors: Contributor[];
  totalNeeded: number;
  eventTitle?: string;
}

const DEMO_CONTRIBUTORS: Contributor[] = [
  { id: '1', name: 'Aaminah', amount: 100, paymentMethod: 'CASH', status: 'paid' },
  { id: '2', name: 'Aaqilah', amount: 100, paymentMethod: 'BANK_TRANSFER', status: 'paid' },
  { id: '3', name: 'Aashikah', amount: 100, paymentMethod: 'CASH', status: 'paid' },
  { id: '4', name: 'Amirah', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '5', name: 'Kauthar', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '6', name: 'Nailah', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '7', name: 'Nisaa', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '8', name: 'Nuhaa', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '9', name: 'Nuriyah', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '10', name: 'Razia', amount: 0, paymentMethod: '', status: 'pending' },
  { id: '11', name: 'Thaakrah', amount: 0, paymentMethod: '', status: 'pending' },
];

export default function PaymentStatusTracker({
  contributors = DEMO_CONTRIBUTORS,
  totalNeeded = 1100,
  eventTitle = 'Girls Evening',
}: PaymentStatusTrackerProps) {
  const paid = contributors.filter(c => c.status === 'paid').length;
  const totalCollected = contributors
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const percentComplete = (totalCollected / totalNeeded) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-4 border-primary/40 p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-extrabold text-primary/70 mb-1 uppercase tracking-wide">💳 Payment Collection</p>
            <h2 className="text-3xl font-extrabold text-foreground">{eventTitle}</h2>
          </div>
          <div className="text-right bg-white rounded-2xl px-4 py-3 shadow-lg">
            <p className="text-4xl font-extrabold text-primary">R{totalCollected}</p>
            <p className="text-xs font-semibold text-foreground/60">of R{totalNeeded}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="w-full h-4 rounded-full bg-white/60 overflow-hidden border-2 border-primary/30 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary via-orange-500 to-accent shadow-lg"
            />
          </div>
          <div className="flex justify-between text-xs text-foreground/60">
            <span>
              {paid}/{contributors.length} paid • {percentComplete.toFixed(0)}%
            </span>
            <span>R{totalNeeded - totalCollected} remaining</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            emoji: '✅',
            label: 'Paid',
            value: paid.toString(),
            color: 'from-green-400 to-emerald-500',
          },
          {
            emoji: '⏳',
            label: 'Pending',
            value: (contributors.length - paid).toString(),
            color: 'from-amber-400 to-orange-500',
          },
          {
            emoji: '💰',
            label: 'Average',
            value: `R${Math.round(totalCollected / (paid || 1))}`,
            color: 'from-blue-400 to-cyan-500',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-2xl bg-gradient-to-br ${stat.color} text-white p-5 text-center shadow-xl transform hover:scale-110 transition-transform`}
          >
            <p className="text-4xl mb-2">{stat.emoji}</p>
            <p className="text-xs font-bold opacity-90 uppercase tracking-wide">{stat.label}</p>
            <p className="font-extrabold text-lg">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Contributors List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-foreground mb-4 flex items-center gap-2">
          👥 Who's Contributed
        </h3>

        {/* Paid Contributors */}
        <div className="space-y-3">
          {contributors
            .filter(c => c.status === 'paid')
            .map((contributor, idx) => (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-green-100 border-2 border-green-400 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-foreground">{contributor.name}</p>
                    <p className="text-sm text-green-700 font-semibold">
                      {contributor.paymentMethod === 'CASH' ? '💵 Cash' : '🏦 Bank Transfer'}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-lg text-green-700 bg-white px-3 py-1 rounded-lg">
                  R{contributor.amount}
                </p>
              </motion.div>
            ))}
        </div>

        {/* Pending Contributors */}
        {contributors.some(c => c.status === 'pending') && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-extrabold text-amber-800 uppercase tracking-wide">⏳ Awaiting Payment</h4>
            {contributors
              .filter(c => c.status === 'pending')
              .map((contributor, idx) => (
                <motion.div
                  key={contributor.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Clock className="w-6 h-6 text-amber-700 flex-shrink-0" />
                    <p className="font-bold text-base text-foreground">{contributor.name}</p>
                  </div>
                  <p className="font-extrabold text-lg text-amber-700 bg-white px-3 py-1 rounded-lg">
                    R100
                  </p>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full p-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-extrabold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 shadow-xl"
      >
        <TrendingUp className="w-5 h-5" />
        Send Payment Reminders
      </motion.button>
    </div>
  );
}
