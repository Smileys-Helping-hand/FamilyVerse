'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, ShoppingCart, DollarSign, Gamepad2, ChevronRight, Zap } from 'lucide-react';

// ── Animated grid canvas (tactical background) ────────────────────────────
function TacticalGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let offset = 0;
    const GRID = 48;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0,240,255,0.07)';
      ctx.lineWidth = 1;

      // Scrolling vertical lines
      for (let x = (offset % GRID); x < canvas.width; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      // Static horizontal lines
      for (let y = 0; y < canvas.height; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Glowing dots at intersections
      ctx.fillStyle = 'rgba(0,255,102,0.18)';
      for (let x = (offset % GRID); x < canvas.width; x += GRID) {
        for (let y = 0; y < canvas.height; y += GRID) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      offset += 0.4;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ── Feature cards ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    emoji: '📍',
    icon: MapPin,
    title: 'Family Radar',
    desc: 'Live GPS tracking for every convoy member — battery level, speed, and real-time location on one full-screen map.',
    color: 'border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.25)]',
    accent: 'text-[#00F0FF]',
  },
  {
    emoji: '🎒',
    icon: ShoppingCart,
    title: 'Quartermaster',
    desc: 'Auto-delegates gear and supplies to the right people the moment an event is created. No arguments, no forgetting.',
    color: 'border-[#00FF66] shadow-[0_0_16px_rgba(0,255,102,0.25)]',
    accent: 'text-[#00FF66]',
  },
  {
    emoji: '💸',
    icon: DollarSign,
    title: 'The Kitty',
    desc: 'Track who paid what, split expenses fairly, and settle up in seconds. No more WhatsApp debates about the bill.',
    color: 'border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.25)]',
    accent: 'text-yellow-400',
  },
  {
    emoji: '🎮',
    icon: Gamepad2,
    title: 'Arcade & Betting',
    desc: 'Live LAN party stats, Blackout, Spy Game, and an in-group betting board. Your lounge is now a proper arena.',
    color: 'border-purple-400 shadow-[0_0_16px_rgba(192,132,252,0.25)]',
    accent: 'text-purple-400',
  },
];

// ── Main page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Once auth resolves, redirect authenticated users immediately
  useEffect(() => {
    if (!loading && user) {
      router.replace(userProfile?.familyId ? '/dashboard' : '/welcome');
    }
  }, [user, userProfile, loading, router]);

  // Authenticated: show minimal loader while redirecting
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0d]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-extrabold text-[#00FF66] animate-pulse">Gang Gear</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Public landing page
  return (
    <div className="relative min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      <TacticalGrid />

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-xs tracking-[0.4em] text-[#00F0FF] uppercase mb-4 font-mono">
          Squad Command Center · v2.0
        </p>
        <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
          Welcome to{' '}
          <span
            className="bg-gradient-to-r from-[#00FF66] via-[#00F0FF] to-[#00FF66] bg-clip-text text-transparent
                       bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
          >
            Gang Gear.
          </span>
        </h1>
        <p className="max-w-xl text-lg text-gray-400 mb-10 leading-relaxed">
          The private command center for our outings, games, and logistics.
          Built for the crew. Runs like a military op.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                       bg-[#00FF66] text-black hover:bg-[#00cc52] transition-all
                       shadow-[0_0_32px_rgba(0,255,102,0.5)] hover:shadow-[0_0_48px_rgba(0,255,102,0.7)]"
          >
            <Zap className="w-5 h-5" />
            Access Terminal (Login)
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 rounded-xl font-bold text-lg border border-[#00F0FF] text-[#00F0FF]
                       hover:bg-[#00F0FF]/10 transition-all"
          >
            Create Account
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1 animate-bounce opacity-50">
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <h2 className="text-center text-3xl font-extrabold mb-3 text-white">
          Everything your squad needs.{' '}
          <span className="text-[#00FF66]">In one place.</span>
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Stop juggling five WhatsApp threads and a shared Google Sheet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className={`relative flex flex-col gap-3 p-6 rounded-2xl bg-[#1A1A1A] border ${f.color} transition-all hover:-translate-y-1 hover:scale-[1.02]`}
            >
              <div className="text-3xl">{f.emoji}</div>
              <h3 className={`text-lg font-bold ${f.accent}`}>{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="relative z-10 py-16 px-6 bg-gradient-to-r from-[#00FF66]/10 via-[#00F0FF]/5 to-[#00FF66]/10 border-t border-b border-[#00FF66]/20 text-center">
        <h2 className="text-3xl font-extrabold mb-4">Ready to run the operation?</h2>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                     bg-[#00FF66] text-black hover:bg-[#00cc52] transition-all
                     shadow-[0_0_32px_rgba(0,255,102,0.4)]"
        >
          <Zap className="w-5 h-5" />
          Log In → Gang Gear
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 text-center text-xs text-gray-600 font-mono">
        gang-gear.co.za · Built with 🔥 for the squad
      </footer>
    </div>
  );
}