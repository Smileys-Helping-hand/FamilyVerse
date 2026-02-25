"use client";
import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic grid/particle background placeholder */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-pulse bg-gradient-to-br from-[#00FF66]/10 via-[#00F0FF]/10 to-[#1A1A1A]" />
      <section className="z-10 text-center mt-24 mb-16">
        <h1 className="text-5xl font-extrabold text-[#00FF66] drop-shadow-lg mb-4">Welcome to Gang Gear.</h1>
        <p className="text-xl text-cyan-200 mb-8">The private command center for our outings, games, and logistics.</p>
        <button className="px-8 py-4 text-2xl font-bold rounded-full bg-[#00FF66] text-[#1A1A1A] shadow-lg hover:bg-[#00F0FF] transition-all animate-glow">
          Access Terminal (Login)
        </button>
      </section>
      <section className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-24">
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <span className="text-4xl mb-2">📍</span>
          <div className="text-lg font-bold text-cyan-300 mb-1">Family Radar</div>
          <div className="text-gray-400">Live location tracking for the crew.</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <span className="text-4xl mb-2">🎒</span>
          <div className="text-lg font-bold text-cyan-300 mb-1">Quartermaster</div>
          <div className="text-gray-400">Auto-delegated gear & supplies.</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <span className="text-4xl mb-2">💸</span>
          <div className="text-lg font-bold text-cyan-300 mb-1">The Kitty</div>
          <div className="text-gray-400">Expense splitting made easy.</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <span className="text-4xl mb-2">🎮</span>
          <div className="text-lg font-bold text-cyan-300 mb-1">Arcade & Betting</div>
          <div className="text-gray-400">Live LAN party stats and games.</div>
        </div>
      </section>
      {/* Add animated grid/particles here for extra polish */}
    </main>
  );
}
