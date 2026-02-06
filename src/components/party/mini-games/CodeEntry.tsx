'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CodeEntryProps {
  onComplete: () => void;
}

export function CodeEntry({ onComplete }: CodeEntryProps) {
  const [code] = useState(Math.floor(1000 + Math.random() * 9000).toString());
  const [userInput, setUserInput] = useState('');
  const [hint, setHint] = useState('');

  useEffect(() => {
    // Generate a hint (first 2 digits)
    setHint(`Hint: Code starts with ${code.slice(0, 2)}...`);
  }, [code]);

  const handleSubmit = () => {
    if (userInput === code) {
      onComplete();
    } else {
      alert('Incorrect code! Try again.');
      setUserInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Enter Access Code</h3>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>

      <div className="p-8 bg-slate-900 rounded-lg border space-y-4">
        <div className="flex justify-center gap-2">
          {code.split('').map((_, idx) => (
            <div
              key={idx}
              className="w-12 h-16 border-2 border-purple-500 rounded-lg flex items-center justify-center text-2xl font-mono bg-slate-800"
            >
              {userInput[idx] || '·'}
            </div>
          ))}
        </div>

        <Input
          type="number"
          maxLength={4}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.slice(0, 4))}
          placeholder="Enter 4-digit code"
          className="text-center text-2xl tracking-widest"
          autoFocus
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={userInput.length !== 4}
        className="w-full"
        size="lg"
      >
        Submit Code
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Actual code: {code} (Look around the room for clues!)
      </p>
    </div>
  );
}
