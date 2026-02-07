'use client';

import { ShieldX, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-950 flex items-center justify-center p-6">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full"
      >
        {/* Alert beacon */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-20 left-1/2 -translate-x-1/2"
        >
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </motion.div>

        {/* Main card */}
        <div className="bg-black/60 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl shadow-red-500/20">
          {/* Shield icon */}
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <ShieldX className="w-24 h-24 text-red-500" />
              <Lock className="absolute bottom-2 right-2 w-8 h-8 text-red-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Text content */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-red-500 tracking-wider uppercase">
              Access Denied
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <p className="text-xl text-white font-semibold">
              🚫 Authorized Personnel Only
            </p>
            
            <p className="text-gray-400 text-sm">
              This area is restricted to system administrators.
              Your access attempt has been logged.
            </p>

            {/* Warning box */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-mono">SECURITY PROTOCOL: IRON GATE</span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                If you believe this is an error, contact the system administrator.
              </p>
            </div>

            {/* Action button */}
            <Link href="/" className="block mt-6">
              <Button 
                variant="outline" 
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Safety
              </Button>
            </Link>
          </div>

          {/* Bottom warning stripe */}
          <div className="mt-8 -mx-8 -mb-8 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-b-xl" />
        </div>

        {/* Floor reflection */}
        <div className="mt-4 text-center text-xs text-red-500/50 font-mono">
          INCIDENT LOGGED • TIMESTAMP: {new Date().toISOString()}
        </div>
      </motion.div>
    </div>
  );
}
