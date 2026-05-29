'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { Sparkles, CalendarCheck } from 'lucide-react';

export default function BookingWidget({ eventId }: { eventId: string }) {
  const [prompt, setPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const { toast } = useToast();

  const handleDraft = async () => {
    setIsDrafting(true);
    // Mock the Gemini draft generation since real Genkit needs backend logic
    setTimeout(() => {
      setDraft({
        venueName: prompt || "Grand Gaming Lounge",
        guests: 4,
        estimatedPrice: 850,
        reference: `BK-AWEH-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toLocaleDateString()
      });
      setIsDrafting(false);
    }, 1500);
  };

  const handleConfirm = async () => {
    if (!draft) return;
    
    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#f43f5e', '#eab308']
    });

    toast({ title: 'Booking Confirmed! ⚡', description: `Reference: ${draft.reference}` });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Gemini Booking Assistant</h2>
        </div>
        
        {!draft ? (
          <div className="space-y-4">
            <p className="text-slate-400">Where do you want to go and how many people? Gemini will draft a booking for you.</p>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. 4 people at Grand Gaming Lounge for tomorrow" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
              <Button 
                onClick={handleDraft}
                disabled={isDrafting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isDrafting ? 'Drafting...' : 'Draft'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-orange-400">{draft.venueName}</h3>
                  <p className="text-sm text-slate-400 mt-1">Date: {draft.date} • Guests: {draft.guests}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Est. Price</p>
                  <p className="font-bold text-xl">R{draft.estimatedPrice}</p>
                </div>
              </div>
              <div className="text-sm bg-slate-900 p-2 rounded text-center font-mono text-rose-400">
                Ref: {draft.reference}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDraft(null)} className="w-full border-slate-700 text-slate-300">Edit</Button>
              <Button onClick={handleConfirm} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-none">
                <CalendarCheck className="mr-2 h-4 w-4" /> ⚡ Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
