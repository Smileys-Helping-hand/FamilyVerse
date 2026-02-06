'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, TrendingUp } from 'lucide-react';
import { placeBetAction } from '@/app/actions/party-logic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface RaceGridDriver {
  id: string;
  name: string;
  avatarUrl: string | null;
  odds: number; // e.g., 2.5x payout multiplier
}

interface BettingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: RaceGridDriver[];
  currentBalance: number;
  onBetPlaced: () => void;
}

export function BettingOverlay({
  isOpen,
  onClose,
  drivers,
  currentBalance,
  onBetPlaced,
}: BettingOverlayProps) {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [wagerAmount, setWagerAmount] = useState(100);
  const [placing, setPlacing] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const { toast } = useToast();

  // Sound effect
  const playCashSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/cash-register.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Audio playback failed, continue silently
      });
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedDriver || wagerAmount <= 0) return;

    setPlacing(true);

    const result = await placeBetAction(selectedDriver, wagerAmount);

    if (result.success) {
      // Show ticket animation
      setShowTicket(true);
      playCashSound();

      // Wait for animation
      setTimeout(() => {
        setShowTicket(false);
        onBetPlaced();
        onClose();
        
        toast({
          title: '🎟️ Bet Placed!',
          description: `${wagerAmount} coins on ${drivers.find(d => d.id === selectedDriver)?.name}`,
        });
      }, 1500);
    } else {
      toast({
        title: '❌ Bet Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setPlacing(false);
  };

  const getSelectedDriver = () => drivers.find(d => d.id === selectedDriver);
  const potentialWinnings = selectedDriver 
    ? Math.floor(wagerAmount * (getSelectedDriver()?.odds || 1))
    : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-purple-900 to-black text-white border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Who Will Win the Next Race?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Balance */}
            <div className="text-center">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-4xl font-bold text-green-400">{currentBalance} 🪙</p>
            </div>

            {/* Driver Grid */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-300">Select a Driver:</p>
              <div className="grid grid-cols-3 gap-3">
                {drivers.map((driver) => (
                  <motion.button
                    key={driver.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDriver(driver.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedDriver === driver.id
                        ? 'border-yellow-500 bg-yellow-500/20 shadow-lg shadow-yellow-500/50'
                        : 'border-gray-600 bg-white/5 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {driver.avatarUrl ? (
                        <img
                          src={driver.avatarUrl}
                          alt={driver.name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                      <p className="font-semibold text-sm">{driver.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {driver.odds}x
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Wager Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-300">Wager Amount:</p>
                <p className="text-2xl font-bold">{wagerAmount} 🪙</p>
              </div>
              
              <Slider
                value={[wagerAmount]}
                onValueChange={(values) => setWagerAmount(values[0])}
                min={50}
                max={currentBalance}
                step={50}
                className="w-full"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWagerAmount(100)}
                  disabled={currentBalance < 100}
                >
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWagerAmount(500)}
                  disabled={currentBalance < 500}
                >
                  500
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWagerAmount(currentBalance)}
                  className="flex-1"
                >
                  ALL IN 🔥
                </Button>
              </div>
            </div>

            {/* Potential Winnings */}
            {selectedDriver && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/30 border border-green-500 rounded-lg p-4 text-center"
              >
                <p className="text-sm text-gray-300">Potential Winnings</p>
                <p className="text-3xl font-bold text-green-400">
                  {potentialWinnings} 🪙
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {wagerAmount} × {getSelectedDriver()?.odds}x
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={placing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceBet}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={!selectedDriver || placing || wagerAmount > currentBalance}
                size="lg"
              >
                {placing ? 'Placing...' : 'Place Bet 🎰'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Flying Animation */}
      <AnimatePresence>
        {showTicket && (
          <motion.div
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0.3,
              x: window.innerWidth - 100,
              y: -window.innerHeight + 100,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="fixed top-1/2 left-1/2 z-[9999] pointer-events-none"
          >
            <div className="bg-yellow-500 text-black p-6 rounded-lg shadow-2xl">
              <p className="text-4xl">🎟️</p>
              <p className="font-bold">Bet Placed!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
