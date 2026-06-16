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
        className="rounded-3xl bg-gradient-to-br from-white via-orange-50 to-amber-50 border-4 border-primary p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
          <p className="text-sm font-extrabold text-primary uppercase tracking-wide">Live Example Scenario</p>
        </div>
        <h1 className="text-4xl font-extrabold mb-3 text-primary">Girls Evening 👯‍♀️</h1>
        <p className="text-foreground/80 mb-6 font-medium text-lg">
          This is a live example of how FamilyVerse makes group event planning effortless.
          Start your own event or customize this one!
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="px-8 py-3 rounded-2xl bg-primary text-white font-extrabold hover:bg-primary/90 transition-all shadow-lg transform hover:scale-105">
            Use This Template
          </button>
          <button className="px-8 py-3 rounded-2xl bg-accent text-primary font-extrabold hover:bg-accent/90 transition-all shadow-lg transform hover:scale-105">
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
        className="rounded-3xl bg-gradient-to-br from-white to-amber-50 border-3 border-primary/30 p-8 shadow-xl"
      >
        <h3 className="font-extrabold text-2xl mb-6 text-primary">✨ What Makes This Magical</h3>
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
            <motion.div key={item.title} className="flex gap-4 p-3 rounded-xl bg-gradient-to-br from-white/80 to-primary/10 border border-primary/20 hover:border-primary/50 transition-colors" whileHover={{ x: 4 }}>
              <span className="text-3xl flex-shrink-0">{item.emoji}</span>
              <div>
                <p className="font-extrabold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-foreground/70 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
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
