'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface WirePuzzleProps {
  onComplete: () => void;
}

type Wire = {
  id: number;
  color: string;
  startY: number;
  endY: number;
};

export function WirePuzzle({ onComplete }: WirePuzzleProps) {
  const [wires] = useState<Wire[]>([
    { id: 1, color: 'bg-red-500', startY: 0, endY: 2 },
    { id: 2, color: 'bg-blue-500', startY: 1, endY: 0 },
    { id: 3, color: 'bg-yellow-500', startY: 2, endY: 1 },
  ]);

  const [connections, setConnections] = useState<{ [key: number]: number }>({});
  const [isChecking, setIsChecking] = useState(false);

  const handleConnect = (wireId: number, slotId: number) => {
    setConnections((prev) => ({ ...prev, [wireId]: slotId }));
  };

  const checkSolution = () => {
    setIsChecking(true);
    setTimeout(() => {
      const isCorrect = wires.every((wire) => connections[wire.id] === wire.endY);
      if (isCorrect) {
        onComplete();
      } else {
        alert('Not quite! Try again.');
        setConnections({});
        setIsChecking(false);
      }
    }, 500);
  };

  const isComplete = Object.keys(connections).length === wires.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Connect the Wires</h3>
        <p className="text-sm text-muted-foreground">
          Match each wire to its correct terminal
        </p>
      </div>

      <div className="relative p-8 bg-slate-900 rounded-lg border">
        {/* Left side - Wire starts */}
        <div className="space-y-8">
          {wires.map((wire, idx) => (
            <div key={wire.id} className="flex items-center gap-4">
              <div className={`w-16 h-4 ${wire.color} rounded`} />
              <div className="flex-1 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((slot) => (
                  <Button
                    key={slot}
                    variant={connections[wire.id] === slot ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConnect(wire.id, slot)}
                    disabled={isChecking}
                  >
                    {connections[wire.id] === slot ? '✓' : String(slot + 1)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Terminal labels */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Terminal Assignments: Red→3, Blue→1, Yellow→2
          </p>
        </div>
      </div>

      <Button
        onClick={checkSolution}
        disabled={!isComplete || isChecking}
        className="w-full"
        size="lg"
      >
        {isChecking ? 'Checking...' : 'Test Connection'}
      </Button>
    </div>
  );
}
