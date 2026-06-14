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
        className="rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 via-purple-50 dark:via-purple-900/20 to-pink-50 dark:to-pink-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-foreground/70 mb-1">Payment Collection</p>
            <h2 className="text-2xl font-bold">{eventTitle}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">R{totalCollected}</p>
            <p className="text-xs text-foreground/60">of R{totalNeeded}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
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
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            emoji: '✅',
            label: 'Paid',
            value: paid.toString(),
            color: 'from-green-400 to-emerald-400',
          },
          {
            emoji: '⏳',
            label: 'Pending',
            value: (contributors.length - paid).toString(),
            color: 'from-amber-400 to-orange-400',
          },
          {
            emoji: '💰',
            label: 'Average',
            value: `R${Math.round(totalCollected / (paid || 1))}`,
            color: 'from-blue-400 to-cyan-400',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl bg-gradient-to-br ${stat.color} text-white p-3 text-center`}
          >
            <p className="text-2xl mb-1">{stat.emoji}</p>
            <p className="text-xs opacity-80">{stat.label}</p>
            <p className="font-bold text-sm">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Contributors List */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-foreground/70 mb-3">Who's Contributed</h3>

        {/* Paid Contributors */}
        <div className="space-y-2">
          {contributors
            .filter(c => c.status === 'paid')
            .map((contributor, idx) => (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{contributor.name}</p>
                    <p className="text-xs text-foreground/50">
                      {contributor.paymentMethod === 'CASH' ? '💵 Cash' : '🏦 Bank Transfer'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm text-green-600 dark:text-green-400">
                  R{contributor.amount}
                </p>
              </motion.div>
            ))}
        </div>

        {/* Pending Contributors */}
        {contributors.some(c => c.status === 'pending') && (
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold text-foreground/50 uppercase">Awaiting Payment</h4>
            {contributors
              .filter(c => c.status === 'pending')
              .map((contributor, idx) => (
                <motion.div
                  key={contributor.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="font-semibold text-sm">{contributor.name}</p>
                  </div>
                  <p className="font-bold text-sm text-amber-600 dark:text-amber-400">
                    R100
                  </p>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Send Payment Reminders
      </motion.button>
    </div>
  );
}
