'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PlanningWelcomeProps {
  eventTitle: string;
  guestCount: number;
  onStart: () => void;
}

export default function PlanningWelcome({
  eventTitle,
  guestCount,
  onStart,
}: PlanningWelcomeProps) {
  const features = [
    {
      icon: DollarSign,
      title: 'Track Budget',
      desc: 'Record contributions from everyone - no tracking confusion',
      color: 'from-emerald-400 to-teal-400',
    },
    {
      icon: ShoppingCart,
      title: 'Smart Shopping',
      desc: 'AI suggests items, delegate who buys what',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      icon: MapPin,
      title: 'Find Shops',
      desc: 'Discover nearby stores with ratings & hours',
      color: 'from-orange-400 to-red-400',
    },
    {
      icon: Users,
      title: 'Team Coordination',
      desc: 'See who\'s bringing what at a glance',
      color: 'from-purple-400 to-pink-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Logo + Title */}
        <div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4 inline-block"
          >
            🎯
          </motion.div>
          <h1 className="text-4xl font-extrabold mb-3">
            Group Event <span className="text-gradient">Planning</span>
          </h1>
          <p className="text-xl text-foreground/70">
            Make organizing <span className="font-bold">{eventTitle}</span> seamless for all {guestCount} of you
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl bg-white/40 dark:bg-white/5 border-2 border-white/20 p-4 backdrop-blur-sm"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} text-white mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-foreground/60">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="rounded-2xl bg-card border-2 border-border p-6 text-left space-y-4">
          <h3 className="font-bold text-lg">Here's how it works:</h3>
          <div className="space-y-3">
            {[
              { step: 1, text: 'Set your budget (we suggest R100 per person)', icon: '💰' },
              { step: 2, text: 'Accept AI suggestions or add your own items', icon: '🤖' },
              { step: 3, text: 'Team members claim items to buy', icon: '✋' },
              { step: 4, text: 'Mark items as bought and track costs', icon: '✅' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Let's Get Started
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Footer */}
        <p className="text-sm text-foreground/50">
          ✨ Share this event with others so they can contribute & help plan together
        </p>
      </motion.div>
    </div>
  );
}
