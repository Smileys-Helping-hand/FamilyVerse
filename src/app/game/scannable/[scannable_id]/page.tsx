'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { scanScannable, getTreasureChainProgress, addToDetectiveNotebook } from '@/app/actions/scannables';
import type { Scannable } from '@/lib/db/schema';
import { Lock, Trophy, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScannableViewer() {
  const params = useParams();
  const router = useRouter();
  const scannableId = params.scannable_id as string;

  const [loading, setLoading] = useState(false);
  const [scannable, setScannable] = useState<Scannable | null>(null);
  const [isCorrectOrder, setIsCorrectOrder] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [solutionInput, setSolutionInput] = useState('');
  const [showContent, setShowContent] = useState(false);

  // Mock user/session (replace with real auth)
  const userId = 'player-1'; // TODO: Get from auth context
  const sessionId = 'session-1'; // TODO: Get from URL or context

  useEffect(() => {
    handleScan();
  }, [scannableId]);

  const handleScan = async () => {
    setLoading(true);
    
    const result = await scanScannable({
      scannableId,
      userId,
      sessionId,
    });

    if (result.success && result.scannable) {
      setScannable(result.scannable);
      setIsCorrectOrder(result.isCorrectOrder || false);

      // If KILLER_EVIDENCE, auto-add to notebook
      if (result.scannable.type === 'KILLER_EVIDENCE') {
        await addToDetectiveNotebook({
          userId,
          sessionId,
          evidenceId: result.scannable.id,
        });
      }

      // Show content if no solution code or correct order
      if (!result.scannable.solutionCode && result.isCorrectOrder) {
        setShowContent(true);
        setShowSuccess(true);
      }
    }
    
    setLoading(false);
  };

  const handleSolutionSubmit = () => {
    if (scannable && solutionInput === scannable.solutionCode) {
      setShowContent(true);
      setShowSuccess(true);
    } else {
      alert('Incorrect code! Try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!scannable) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Scannable Not Found</CardTitle>
            <CardDescription>This QR code is not valid</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Treasure hunt out-of-order
  if (scannable.type === 'TREASURE_NODE' && !isCorrectOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-600">
                <Lock className="h-6 w-6" />
                <CardTitle>Locked Clue!</CardTitle>
              </div>
              <CardDescription>
                You found <strong>{scannable.label}</strong>, but it&apos;s locked!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is part of a treasure hunt chain. You need to find and scan the previous clues in order first.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900">
                  💡 Keep exploring! You&apos;re on the right track.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Solution code required
  if (scannable.solutionCode && !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-600">
              <Lock className="h-6 w-6" />
              <CardTitle>{scannable.label}</CardTitle>
            </div>
            <CardDescription>This clue is password protected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="solution">Enter Solution Code</Label>
              <Input
                id="solution"
                type="text"
                placeholder="Enter code..."
                value={solutionInput}
                onChange={(e) => setSolutionInput(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={handleSolutionSubmit} className="w-full">
              Unlock Clue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success states
  const getBgGradient = () => {
    switch (scannable.type) {
      case 'TASK':
        return 'from-green-50 to-emerald-50';
      case 'TREASURE_NODE':
        return 'from-yellow-50 to-amber-50';
      case 'KILLER_EVIDENCE':
        return 'from-red-50 to-pink-50';
      default:
        return 'from-blue-50 to-cyan-50';
    }
  };

  const getIcon = () => {
    switch (scannable.type) {
      case 'TASK':
        return <CheckCircle2 className="h-8 w-8" />;
      case 'TREASURE_NODE':
        return <Trophy className="h-8 w-8" />;
      case 'KILLER_EVIDENCE':
        return <FileText className="h-8 w-8" />;
    }
  };

  const getTypeLabel = () => {
    switch (scannable.type) {
      case 'TASK':
        return 'Task Complete';
      case 'TREASURE_NODE':
        return 'Clue Found';
      case 'KILLER_EVIDENCE':
        return 'Evidence Collected';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${getBgGradient()}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <CardTitle>{scannable.label}</CardTitle>
                <Badge className="mt-1">{getTypeLabel()}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-4"
              >
                <div className="text-6xl mb-2">✨</div>
                <p className="text-lg font-medium">
                  {scannable.type === 'KILLER_EVIDENCE' && 'Added to Detective Notebook'}
                  {scannable.type === 'TREASURE_NODE' && 'Clue Unlocked!'}
                  {scannable.type === 'TASK' && 'Well Done!'}
                </p>
              </motion.div>
            )}

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">
                {scannable.content || <em>No additional information</em>}
              </p>
            </div>

            {scannable.rewardPoints && scannable.rewardPoints > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg py-2 px-4">
                  +{scannable.rewardPoints} Points
                </Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
              {scannable.type === 'KILLER_EVIDENCE' && (
                <Button className="flex-1" onClick={() => router.push('/game/notebook')}>
                  View Notebook
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
