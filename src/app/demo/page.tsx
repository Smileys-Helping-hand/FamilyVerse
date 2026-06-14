'use client';

import { motion } from 'framer-motion';
import EventDemo from '@/components/events/EventDemo';
import PaymentStatusTracker from '@/components/events/PaymentStatusTracker';
import { Sparkles, Heart, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>🏡 FamilyVerse</span>
          </Link>
          <Link
            href="/events"
            className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all"
          >
            Go to Events
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <p className="font-bold text-primary">LIVE DEMO</p>
          </div>
          <h1 className="text-5xl font-extrabold mb-4">
            See How Easy Event Planning Can Be
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
            Meet the Girls Evening — a real example showing how FamilyVerse transforms group coordination
            from stressful spreadsheets to seamless teamwork.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Explore This Event
            </button>
            <Link
              href="/events"
              className="px-8 py-3 rounded-xl bg-primary/10 text-primary font-bold border-2 border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create Your Own
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Two Column Layout */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Event Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <EventDemo />
          </motion.div>

          {/* Right: Payment Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PaymentStatusTracker
              eventTitle="Girls Evening"
              totalNeeded={1100}
              contributors={[
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
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold mb-3">What Makes This Magic</h2>
            <p className="text-foreground/70">
              These features come together to make group planning effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '📱',
                title: 'WhatsApp Native',
                desc: 'Share event with one-tap WhatsApp. Cousins join instantly.',
              },
              {
                emoji: '🤖',
                title: 'AI Suggestions',
                desc: 'Suggests vendors, quantities, and costs automatically.',
              },
              {
                emoji: '💰',
                title: 'Fair Splitting',
                desc: 'Shows exactly who paid, who owes, cost per person.',
              },
              {
                emoji: '🏪',
                title: 'Shop Finder',
                desc: 'Browse Checkers, Pick n Pay, Makro with hours & ratings.',
              },
              {
                emoji: '🔄',
                title: 'Real-Time Sync',
                desc: 'Everyone sees updates instantly, no refresh needed.',
              },
              {
                emoji: '✅',
                title: 'Task Delegation',
                desc: 'Clear who is bringing what, no confusion.',
              },
              {
                emoji: '📊',
                title: 'Budget Dashboard',
                desc: 'Visual breakdown of meals, snacks, drinks, decorations.',
              },
              {
                emoji: '📱',
                title: 'Mobile Perfect',
                desc: 'Beautiful on phones, works offline-first.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="rounded-xl bg-background border-2 border-border p-4 text-center hover:border-primary/30 transition-colors"
              >
                <p className="text-3xl mb-2">{feature.emoji}</p>
                <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-foreground/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-accent text-white p-12 text-center shadow-2xl"
        >
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-extrabold mb-4">Ready to Plan Like This?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Create your own event and experience the magic of stress-free group coordination.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-bold text-lg hover:bg-white/90 transition-all shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Event
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
