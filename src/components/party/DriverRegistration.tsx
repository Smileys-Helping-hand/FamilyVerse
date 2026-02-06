'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { registerAsDriverAction, markDriverReadyAction } from '@/app/actions/party-logic';
import { useToast } from '@/hooks/use-toast';
import { usePartySocket } from '@/hooks/use-party-socket';

interface DriverRegistrationProps {
  userId: string;
  gameId: string;
}

export function DriverRegistration({ userId, gameId }: DriverRegistrationProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);
  const { toast } = useToast();

  // Listen for race state changes
  usePartySocket({
    channel: 'sim-racing',
    event: 'betting-open',
    callback: () => {
      setBettingOpen(true);
      toast({
        title: '🎰 BETTING IS OPEN!',
        description: '60 seconds to place your bets!',
      });
    },
  });

  usePartySocket({
    channel: 'sim-racing',
    event: 'race-started',
    callback: () => {
      setRaceStarted(true);
      setBettingOpen(false);
      toast({
        title: '🏁 RACE STARTED!',
        description: 'Betting is now closed. Good luck!',
      });
    },
  });

  const handleRegister = async () => {
    const result = await registerAsDriverAction(gameId);
    
    if (result.success) {
      setIsRegistered(true);
      toast({
        title: '✅ Registered as Driver!',
        description: 'Now mark yourself as ready when you are set',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleMarkReady = async () => {
    const result = await markDriverReadyAction(gameId);
    
    if (result.success) {
      setIsReady(true);
      toast({
        title: '✅ Marked as Ready!',
        description: result.allReady ? 'All drivers ready! Host will open betting soon.' : 'Waiting for other drivers...',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (raceStarted) {
    return (
      <Card className="border-2 border-green-500">
        <CardContent className="pt-6 text-center">
          <Flag className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2">🏁 RACE IN PROGRESS!</h3>
          <p className="text-muted-foreground">Good luck out there!</p>
        </CardContent>
      </Card>
    );
  }

  if (bettingOpen) {
    return (
      <Card className="border-2 border-yellow-500 animate-pulse">
        <CardContent className="pt-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <h3 className="text-3xl font-bold mb-2">🎰 BETTING OPEN!</h3>
          </motion.div>
          <p className="text-muted-foreground">Place your bets now!</p>
          <Badge variant="default" className="mt-2">You're in the race!</Badge>
        </CardContent>
      </Card>
    );
  }

  if (!isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Join Next Race
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Want to compete in the sim racing? Register as a driver!
          </p>
          <Button 
            onClick={handleRegister} 
            className="w-full" 
            size="lg"
          >
            🏎️ Register as Driver
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            You're Registered!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              When you're ready to race, mark yourself as ready. Race starts when all drivers are ready!
            </p>
          </div>
          <Button 
            onClick={handleMarkReady} 
            className="w-full" 
            size="lg"
            variant="default"
          >
            ✓ I'm Ready to Race!
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-500">
      <CardContent className="pt-6 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">✅ You're Ready!</h3>
        <p className="text-sm text-muted-foreground">
          Waiting for other drivers and host to open betting...
        </p>
        <Badge variant="default" className="mt-2">Driver Ready</Badge>
      </CardContent>
    </Card>
  );
}
