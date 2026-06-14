'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Users, AlertCircle } from 'lucide-react';

interface DemoFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  metric: string;
  color: string;
}

const DEMO_FEATURES: DemoFeature[] = [
  {
    title: 'Cost Per Person',
    description: 'See exactly how much each person needs to contribute',
    icon: <TrendingDown className="w-5 h-5" />,
    metric: 'R100',
    color: 'from-emerald-400 to-teal-400',
  },
  {
    title: 'Payment Status',
    description: '11 girls planned, 3 have paid, 8 pending',
    icon: <Users className="w-5 h-5" />,
    metric: '27% Paid',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    title: 'Smart Breakdown',
    description: 'R80 for food, R20 for snacks - perfectly balanced',
    icon: <AlertCircle className="w-5 h-5" />,
    metric: 'Optimized',
    color: 'from-amber-400 to-orange-400',
  },
  {
    title: 'Vendor Assigned',
    description: 'Aaminah is bringing pizza, Aaqilah bringing dessert',
    icon: <Sparkles className="w-5 h-5" />,
    metric: '8/11 Claimed',
    color: 'from-pink-400 to-rose-400',
  },
];

export default function EventDemo() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-2 border-primary/20 p-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <p className="text-sm font-bold text-primary">EXAMPLE SCENARIO</p>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Girls Evening 👯‍♀️</h1>
        <p className="text-foreground/70 mb-4">
          This is a live example of how FamilyVerse makes group event planning effortless.
          Start your own event or customize this one!
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all">
            Use This Template
          </button>
          <button className="px-6 py-2 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all border-2 border-primary/20">
            Create My Own
          </button>
        </div>
      </motion.div>

      {/* Demo Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_FEATURES.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-2xl bg-gradient-to-br ${feature.color} text-white p-6 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                {feature.icon}
              </div>
              <p className="text-3xl font-bold">{feature.metric}</p>
            </div>
            <h3 className="font-bold mb-1">{feature.title}</h3>
            <p className="text-sm opacity-90">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* What Makes This Magical */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-card border-2 border-border p-6"
      >
        <h3 className="font-bold text-lg mb-4">✨ What Makes This Magical</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              emoji: '💬',
              title: 'Smart WhatsApp Sharing',
              desc: 'One click sends a pre-filled message with all event details',
            },
            {
              emoji: '🤖',
              title: 'AI Vendor Suggestions',
              desc: 'Automatically suggests food options like BR Pizza, Flavahood',
            },
            {
              emoji: '💰',
              title: 'Fair Cost Splitting',
              desc: 'Calculates exactly who owes what, no math needed',
            },
            {
              emoji: '📱',
              title: 'Mobile Perfect',
              desc: 'Works beautifully on phones, no app download needed',
            },
            {
              emoji: '🔄',
              title: 'Real-Time Updates',
              desc: 'Everyone sees contributions the moment they happen',
            },
            {
              emoji: '🏪',
              title: 'Shop Finder',
              desc: 'Browse nearby Checkers, Pick n Pay, Makro with hours & ratings',
            },
          ].map((item, idx) => (
            <div key={item.title} className="flex gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-foreground/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-primary to-accent text-white p-8 text-center"
      >
        <h2 className="text-2xl font-extrabold mb-2">Ready to Plan Your Event?</h2>
        <p className="mb-6 opacity-90">
          See how FamilyVerse transforms group planning from stressful to seamless.
        </p>
        <button className="px-8 py-3 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-all shadow-lg">
          Create Your First Event
        </button>
      </motion.div>
    </div>
  );
}
