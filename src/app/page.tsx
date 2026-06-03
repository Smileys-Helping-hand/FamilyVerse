'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Users, MapPin, Sparkles, ArrowRight, CheckCircle2,
  MessageCircle, Star, Heart, Zap, Clock, ClipboardList
} from 'lucide-react';

const FEATURES = [
  {
    emoji: '🗓️',
    icon: Calendar,
    title: 'Plan in seconds',
    desc: 'Tell us what you want to do in plain language. AI builds the full plan — date, venue, tasks, supplies.',
    color: 'from-orange-400 to-rose-400',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    emoji: '👥',
    icon: Users,
    title: 'Invite your people',
    desc: 'Add family and friends. Send invites via WhatsApp, AwehChat, or email. Everyone stays in the loop.',
    color: 'from-teal-400 to-emerald-400',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    emoji: '📍',
    icon: MapPin,
    title: 'AI venue research',
    desc: 'Pick a place and let AI research it — parking, what to bring, weather on the day, nearby options.',
    color: 'from-amber-400 to-orange-400',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    emoji: '✅',
    icon: ClipboardList,
    title: 'Auto task delegation',
    desc: 'Tasks get created and assigned automatically. Everyone knows their role. No more WhatsApp chaos.',
    color: 'from-violet-400 to-purple-400',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    emoji: '💬',
    icon: MessageCircle,
    title: 'All-in-one chat',
    desc: 'Built-in group chat powered by AwehChat/MosWords. Comment, plan, post notes — all in one place.',
    color: 'from-sky-400 to-blue-400',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
  {
    emoji: '🏨',
    icon: Zap,
    title: 'One-tap booking',
    desc: 'Like Gemini\'s booking widget — tell us where, how many people, and we\'ll pre-fill the booking. You just press confirm.',
    color: 'from-pink-400 to-rose-400',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
];

const STEPS = [
  { num: '1', title: 'Sign up & add your people', desc: 'Create your account and build your friends list. Import from AwehChat or Nexus — all your contacts in one place.' },
  { num: '2', title: 'Create an event', desc: 'Type what you want to do. "Games day at The Ark for 12 people this Saturday." AI does the rest.' },
  { num: '3', title: 'AI plans it for you', desc: 'Venue research, weather check, supply list, task delegation. Everything handled automatically.' },
  { num: '4', title: 'Invite & enjoy', desc: 'Send invites via WhatsApp or AwehChat. Everyone RSVPs, tasks get delegated, you just show up.' },
];

const TESTIMONIALS = [
  { name: 'Fatima R.', role: 'Mom of 3', text: 'Planned our whole family braai in 2 minutes. Normally takes a week of WhatsApp back and forth!', emoji: '🎉' },
  { name: 'Abduraziq', role: 'Family organiser', text: 'Finally something that works for SA families. The AwehChat integration is perfect for our crew.', emoji: '🙌' },
  { name: 'Yusuf K.', role: 'Uncle vibes', text: 'Games day sorted in minutes. Everyone knew what to bring. Zero chaos. First time ever.', emoji: '🎮' },
];

function FloatingBlob({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
  );
}

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(userProfile?.familyId ? '/dashboard' : '/welcome');
    }
  }, [user, userProfile, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏡</span>
            <span className="text-2xl font-extrabold text-gradient">FamilyVerse</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-bounce transition-all">🏡</span>
            <span className="text-xl font-extrabold text-gradient">FamilyVerse</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90 transition-all glow-primary"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4">
        <FloatingBlob className="w-96 h-96 bg-primary top-0 -left-20" />
        <FloatingBlob className="w-80 h-80 bg-secondary bottom-0 -right-10" />
        <FloatingBlob className="w-64 h-64 bg-accent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              The ultimate family event planner
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Plan events{' '}
              <span className="text-gradient-warm">your family</span>
              <br />
              will remember 🎉
            </h1>

            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              From a quick games day to a full family reunion — FamilyVerse handles the planning, coordination,
              tasks, and communication so you just show up and have fun.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg
                           bg-primary text-white shadow-xl hover:shadow-2xl hover:bg-primary/90 transition-all
                           glow-primary"
              >
                Start Planning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg
                           border-2 border-border bg-card/80 hover:bg-card transition-all"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-foreground/50">
              {['No credit card needed', 'WhatsApp invites', 'AI-powered planning', 'Works on all devices'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Event preview card ── */}
      <section className="px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎮</span>
              <div>
                <div className="font-bold text-lg">Games Day at The Ark</div>
                <div className="text-sm text-foreground/50">Saturday, 7 June 2026 · 12 people</div>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/20">
                AI Planned ✨
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { emoji: '🌤️', label: 'Weather', value: '22°C Clear' },
                { emoji: '🅿️', label: 'Parking', value: 'Free on-site' },
                { emoji: '🎒', label: 'Supplies', value: '8 items delegated' },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-muted/60 p-3 text-center">
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <div className="text-xs text-foreground/50">{item.label}</div>
                  <div className="text-sm font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { who: 'Abduraziq', task: 'Bring the braai grid & charcoal', done: true },
                { who: 'Fatima', task: 'Pick up drinks & snacks', done: true },
                { who: 'Yusuf', task: 'Set up the games station', done: false },
              ].map(item => (
                <div key={item.task} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? 'text-secondary' : 'text-foreground/25'}`} />
                  <span className="text-sm flex-1">{item.task}</span>
                  <span className="text-xs text-foreground/40 font-medium">{item.who}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[#25D366] text-white">
                <MessageCircle className="w-4 h-4" /> WhatsApp Invite
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                <MessageCircle className="w-4 h-4" /> AwehChat
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Everything you need,{' '}
              <span className="text-gradient">nothing you don't</span>
            </h2>
            <p className="text-foreground/55 text-lg max-w-xl mx-auto">
              Built for real South African families — big groups, last-minute plans, WhatsApp culture and all.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`relative rounded-2xl p-6 ${f.bg} border ${f.border} card-hover`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} text-white mb-4 shadow-md`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">How it works</h2>
            <p className="text-foreground/55">Four steps from idea to epic family event.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm"
              >
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">Loved by families 💛</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="text-2xl mb-3">{t.emoji}</div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-foreground/50">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-orange-500 to-accent rounded-3xl p-10 text-white shadow-2xl"
          >
            <Heart className="w-10 h-10 mx-auto mb-4 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Your next family moment starts here
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Free to start. Takes 30 seconds. Your cousins will thank you.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-white text-primary hover:bg-white/90 transition-all shadow-xl"
            >
              Create Your First Event <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm text-foreground/40 border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🏡</span>
          <span className="font-bold text-foreground/60">FamilyVerse</span>
        </div>
        <p>Built with love for South African families · Powered by AwehChat & Nexus</p>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </div>
      </footer>

    </div>
  );
}
