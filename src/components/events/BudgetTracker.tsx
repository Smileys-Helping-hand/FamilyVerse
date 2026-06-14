'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Check,
  AlertCircle,
  Wallet,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getEventBudget,
  getContributionSummary,
  addContribution,
} from '@/app/actions/event-budget';

interface BudgetTrackerProps {
  eventId: string;
  currentUserId: string;
  currentUserName: string;
}

export default function BudgetTracker({
  eventId,
  currentUserId,
  currentUserName,
}: BudgetTrackerProps) {
  const [budget, setBudget] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [contribution, setContribution] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    loadBudgetData();
  }, [eventId]);

  const loadBudgetData = async () => {
    setLoading(true);
    const [budgetRes, summaryRes] = await Promise.all([
      getEventBudget(eventId),
      getContributionSummary(eventId),
    ]);

    if (budgetRes.success) setBudget(budgetRes.budget);
    if (summaryRes.success) setSummary(summaryRes.summary);
    setLoading(false);
  };

  const handleAddContribution = async () => {
    if (!contribution || isNaN(Number(contribution))) return;

    const amount = Math.round(Number(contribution) * 100);
    const res = await addContribution(
      eventId,
      currentUserId,
      currentUserName,
      amount,
      paymentMethod
    );

    if (res.success) {
      setContribution('');
      setShowAddContribution(false);
      loadBudgetData();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="rounded-2xl bg-primary/10 border-2 border-primary/20 p-6 text-center">
        <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-sm text-foreground/70">No budget set yet</p>
      </div>
    );
  }

  const totalNeeded = summary?.totalNeeded || 0;
  const totalContributed = summary?.totalContributed || 0;
  const balance = summary?.balance || 0;
  const percentageComplete = totalNeeded > 0 ? (totalContributed / totalNeeded) * 100 : 0;
  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* Main Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-foreground/60 mb-1">Total Budget</p>
            <h3 className="text-3xl font-bold">{formatCurrency(totalNeeded)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">Contributions collected</span>
            <span className="font-semibold">{percentageComplete.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageComplete}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/40 dark:bg-white/5 p-3 text-center">
            <p className="text-xs text-foreground/60 mb-1">Contributed</p>
            <p className="font-bold text-sm">{formatCurrency(totalContributed)}</p>
          </div>
          <div className={cn(
            'rounded-xl p-3 text-center',
            balance > 0
              ? 'bg-orange-100/50 dark:bg-orange-900/20'
              : 'bg-secondary/10'
          )}>
            <p className="text-xs text-foreground/60 mb-1">Balance</p>
            <p className={cn(
              'font-bold text-sm',
              balance > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-secondary'
            )}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="rounded-xl bg-white/40 dark:bg-white/5 p-3 text-center">
            <p className="text-xs text-foreground/60 mb-1">Contributors</p>
            <p className="font-bold text-sm">{summary?.contributors || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Contributions List */}
      {summary?.contributions && summary.contributions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border-2 border-border p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm">Contributions</h4>
          </div>
          <div className="space-y-2">
            {summary.contributions.map((contrib: any, idx: number) => (
              <motion.div
                key={contrib.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{contrib.userName}</p>
                  <p className="text-xs text-foreground/50">{contrib.paymentMethod}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{formatCurrency(contrib.amount)}</span>
                  <Check className="w-4 h-4 text-secondary" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Contribution Button */}
      {!showAddContribution ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddContribution(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Record Contribution
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-card border-2 border-primary/20 p-4 space-y-4"
        >
          <h4 className="font-bold text-sm">Record Your Contribution</h4>

          <div>
            <label className="text-xs font-semibold text-foreground/60 mb-2 block">
              Amount (ZAR)
            </label>
            <input
              type="number"
              step="0.01"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              placeholder="e.g., 100"
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/60 mb-2 block">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:border-primary"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddContribution}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowAddContribution(false);
                setContribution('');
              }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Alert if balance exists */}
      {balance > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-orange-100/50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800/50 p-4 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
              {formatCurrency(balance)} still needed
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Share this event with others so everyone can contribute
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
