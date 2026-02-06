'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SequenceMatchProps {
  onComplete: () => void;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];

export function SequenceMatch({ onComplete }: SequenceMatchProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const generateSequence = () => {
    const length = 5;
    const newSequence = Array.from({ length }, () => 
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    setSequence(newSequence);
  };

  useEffect(() => {
    generateSequence();
  }, []);

  const showSequence = async () => {
    setHasStarted(true);
    setIsShowing(true);
    setUserSequence([]);
    
    for (let i = 0; i < sequence.length; i++) {
      setCurrentIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsShowing(false);
    setCurrentIndex(-1);
  };

  const handleColorClick = (color: string) => {
    if (isShowing) return;
    
    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    // Check if correct
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      alert('Wrong sequence! Try again.');
      setUserSequence([]);
      return;
    }

    // Check if complete
    if (newUserSequence.length === sequence.length) {
      onComplete();
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500 hover:bg-red-600';
      case 'blue': return 'bg-blue-500 hover:bg-blue-600';
      case 'green': return 'bg-green-500 hover:bg-green-600';
      case 'yellow': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sequence Memory</h3>
        <p className="text-sm text-muted-foreground">
          Watch the sequence, then repeat it
        </p>
      </div>

      <div className="p-8 bg-slate-900 rounded-lg border">
        {/* Color buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {COLORS.map((color) => (
            <motion.button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={isShowing || !hasStarted}
              className={`h-24 rounded-lg ${getColorClass(color)} transition-all ${
                isShowing && sequence[currentIndex] === color
                  ? 'ring-4 ring-white'
                  : ''
              } ${
                userSequence.includes(color) && !isShowing
                  ? 'opacity-50'
                  : ''
              }`}
              whileTap={{ scale: 0.95 }}
              animate={
                isShowing && sequence[currentIndex] === color
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="text-center text-sm text-muted-foreground">
          {hasStarted ? (
            <p>
              Progress: {userSequence.length}/{sequence.length}
            </p>
          ) : (
            <p>Click "Show Sequence" to start</p>
          )}
        </div>
      </div>

      {!hasStarted && (
        <Button onClick={showSequence} className="w-full" size="lg">
          Show Sequence
        </Button>
      )}

      {hasStarted && !isShowing && userSequence.length > 0 && (
        <Button
          onClick={() => {
            setUserSequence([]);
            showSequence();
          }}
          variant="outline"
          className="w-full"
        >
          Restart
        </Button>
      )}
    </div>
  );
}
