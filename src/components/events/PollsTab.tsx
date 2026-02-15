'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Check, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPoll, votePoll, getEventPolls, closePoll } from '@/app/actions/events';
import { getPusherClient } from '@/lib/pusher/client';
import { formatDistanceToNow } from 'date-fns';

interface PollsTabProps {
  eventId: string;
  currentUser: {
    uid: string;
    name: string;
  };
}

export function PollsTab({ eventId, currentUser }: PollsTabProps) {
  const [polls, setPolls] = useState<any[]>([]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const { toast } = useToast();

  // Form state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState('5'); // minutes

  useEffect(() => {
    loadPolls();
  }, [eventId]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('poll-created', () => {
      loadPolls();
    });

    channel.bind('poll-vote', () => {
      loadPolls();
    });

    channel.bind('poll-closed', () => {
      loadPolls();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [eventId]);

  const loadPolls = async () => {
    const result = await getEventPolls(eventId);
    if (result.success) {
      setPolls(result.polls);
    }
  };

  const handleCreatePoll = async () => {
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (!question.trim() || validOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'Please provide a question and at least 2 options',
        variant: 'destructive',
      });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(duration));

    const result = await createPoll({
      eventId,
      question,
      options: validOptions,
      creatorId: currentUser.uid,
      creatorName: currentUser.name,
      expiresAt,
    });

    if (result.success) {
      toast({
        title: 'Poll Created',
        description: `"${question}" is now live!`,
      });
      setIsCreatingPoll(false);
      setQuestion('');
      setOptions(['', '']);
      setDuration('5');
      loadPolls();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    const result = await votePoll({
      pollId,
      userId: currentUser.uid,
      userName: currentUser.name,
      optionIndex,
    });

    if (result.success) {
      toast({
        title: 'Vote Recorded',
        description: 'Your vote has been counted!',
      });
      loadPolls();
    }
  };

  const handleClosePoll = async (pollId: string) => {
    const result = await closePoll(pollId);
    if (result.success) {
      toast({
        title: 'Poll Closed',
        description: 'Voting has ended',
      });
      loadPolls();
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🗳️ Quick Polls</CardTitle>
              <CardDescription>Make decisions together, fast</CardDescription>
            </div>
            
            <Dialog open={isCreatingPoll} onOpenChange={setIsCreatingPoll}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Poll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a Poll</DialogTitle>
                  <DialogDescription>
                    Stop the "I don't know, what do you want?" loop
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., Dinner Spot?"
                    />
                  </div>

                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2 mt-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {options.length > 2 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {options.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="mt-2 w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Auto-close after (minutes)</Label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="1"
                      max="60"
                    />
                  </div>

                  <Button onClick={handleCreatePoll} className="w-full">
                    Create Poll
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Polls List */}
      {polls.length > 0 ? (
        <div className="space-y-4">
          {polls.map(poll => {
            const totalVotes = poll.votes.length;
            const userVote = poll.votes.find((v: any) => v.userId === currentUser.uid);
            const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
            const isClosed = poll.isClosed || isExpired;

            // Calculate vote counts per option
            const voteCounts = poll.options.map((_: any, index: number) => 
              poll.votes.filter((v: any) => v.optionIndex === index).length
            );

            const winningIndex = voteCounts.indexOf(Math.max(...voteCounts));

            return (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">
                          by {poll.creatorName}
                        </span>
                        {isClosed ? (
                          <Badge variant="secondary">Closed</Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {poll.expiresAt && formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {poll.creatorId === currentUser.uid && !isClosed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePoll(poll.id)}
                      >
                        Close Poll
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((option: string, index: number) => {
                      const votes = voteCounts[index];
                      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                      const isUserVote = userVote?.optionIndex === index;
                      const isWinner = isClosed && index === winningIndex;

                      return (
                        <button
                          key={index}
                          onClick={() => !isClosed && handleVote(poll.id, index)}
                          disabled={isClosed}
                          className={`
                            w-full text-left p-3 rounded-lg border-2 transition-all
                            ${isUserVote ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border'}
                            ${isWinner ? 'bg-green-50 dark:bg-green-950 border-green-500' : ''}
                            ${!isClosed ? 'hover:border-blue-300 cursor-pointer' : 'cursor-not-allowed'}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium flex items-center gap-2">
                              {option}
                              {isUserVote && <Check className="h-4 w-4 text-blue-500" />}
                              {isWinner && <span className="text-green-600">👑 Winner</span>}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {votes} {votes === 1 ? 'vote' : 'votes'}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {percentage.toFixed(0)}%
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No polls yet. Create one to make quick decisions!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
