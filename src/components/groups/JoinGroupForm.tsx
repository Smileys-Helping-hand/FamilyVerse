'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

export function JoinGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to join a group.",
        variant: "destructive",
      });
      return;
    }

    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Here you would integrate with Firebase to join the group
      // For now, this is a placeholder
      
      toast({
        title: "Joined Group!",
        description: "You've successfully joined the group.",
      });

      setJoinCode('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Invalid join code or group not found.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join a Group
        </CardTitle>
        <CardDescription>
          Enter a join code to become part of an existing group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              id="joinCode"
              placeholder="Enter the group join code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
