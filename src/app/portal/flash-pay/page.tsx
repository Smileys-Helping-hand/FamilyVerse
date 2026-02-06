'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Banknote,
  Camera,
  Users,
  Calculator,
  Send,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FlashPayPage() {
  const { toast } = useToast();
  const [billAmount, setBillAmount] = useState('');
  const [numPeople, setNumPeople] = useState('2');
  const [splitAmount, setSplitAmount] = useState<number | null>(null);

  const handleCalculate = () => {
    const amount = parseFloat(billAmount);
    const people = parseInt(numPeople);
    
    if (!amount || !people || people < 1) {
      toast({
        title: 'Eish! 😅',
        description: 'Please enter valid amounts, china.',
        variant: 'destructive',
      });
      return;
    }

    const split = amount / people;
    setSplitAmount(split);
    
    toast({
      title: 'Lekker! 💸',
      description: `Each person owes R${split.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 relative overflow-hidden">
      {/* Animated Background with Better Blending */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-green-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-teal-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-emerald-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Gradient overlay for smoother blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-2xl">
              <Banknote className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                Flash Pay
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </h1>
              <p className="text-lg text-green-200 mt-1">
                Split the bill, no stress 💸
              </p>
            </div>
          </div>
          
          <Link href="/portal">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </Link>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-yellow-500/10 border-2 border-yellow-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-yellow-200 font-semibold">🚧 Under Construction</p>
                  <p className="text-yellow-300/70 text-sm">OCR receipt scanning coming soon! For now, use the manual calculator below.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* OCR Scanner - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 opacity-50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-green-400" />
                  Scan Receipt
                  <Badge variant="secondary" className="ml-auto">Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Snap a photo and AI does the math
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-700">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">OCR Coming Soon</p>
                  </div>
                </div>
                <Button disabled className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manual Calculator - Active */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-lg border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-400" />
                  Quick Calculator
                  <Badge variant="default" className="ml-auto bg-green-500">Active</Badge>
                </CardTitle>
                <CardDescription>
                  Manual bill splitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300">Total Bill (R)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="350.00"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="people" className="text-slate-300">Number of People</Label>
                  <Input
                    id="people"
                    type="number"
                    placeholder="2"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white text-lg"
                  />
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-xl hover:shadow-green-500/50"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Split
                </Button>

                {splitAmount !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-500/10 border-2 border-green-500/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-sm text-green-200">Each person owes:</p>
                        <p className="text-3xl font-bold text-white">
                          R{splitAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Coming Features</CardTitle>
              <CardDescription>What we're building for you, china 🔥</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <Camera className="w-8 h-8 text-purple-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">OCR Scanner</h3>
                  <p className="text-sm text-slate-400">
                    Snap receipt, AI extracts items & prices
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Smart Split</h3>
                  <p className="text-sm text-slate-400">
                    Assign items to people, calculate fairly
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <Send className="w-8 h-8 text-green-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Payment Requests</h3>
                  <p className="text-sm text-slate-400">
                    Send payment links via WhatsApp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
