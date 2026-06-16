'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { acceptGangInvitationAction } from '@/app/actions/gang-invitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function JoinGangPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const token = params.token as string;

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate token format
  useEffect(() => {
    if (!token || token.length < 8) {
      setError('Invalid invitation link');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!guestName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await acceptGangInvitationAction(token, guestName, guestEmail);

    if (result.success) {
      setAccepted(true);
      toast({
        title: 'Welcome! 🎉',
        description: `You've been added to the gang, ${guestName}!`,
      });
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/the-gang');
      }, 2000);
    } else {
      setError(result.error || 'Failed to join gang');
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (error && !guestName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-extrabold text-foreground">Invalid Invitation</h1>
            <p className="text-foreground/70">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl space-y-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome to the Gang! 🎉</h1>
            <p className="text-foreground/70">You've been added successfully. Redirecting...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-white p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Users className="w-12 h-12 text-primary mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground">Join the Gang! 👯</h1>
            <p className="text-foreground/70">You're invited to be part of this amazing family squad</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAccept();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Your Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-12 text-base border-2 focus:border-primary"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Your Email (optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="h-12 text-base border-2 focus:border-primary"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !guestName.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Join the Gang
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="rounded-xl bg-primary/10 p-4 text-sm text-foreground/70">
            <p>💡 You'll be added to the family squad and can start collaborating right away!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
