'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { completeTask, getTaskByQrData } from '@/app/actions/tasks';
import { WirePuzzle } from '@/components/party/mini-games/WirePuzzle';
import { CodeEntry } from '@/components/party/mini-games/CodeEntry';
import { SequenceMatch } from '@/components/party/mini-games/SequenceMatch';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function TaskPage() {
  const params = useParams();
  const { toast } = useToast();
  const taskId = params.task_id as string;

  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [bonusSeconds, setBonusSeconds] = useState(0);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const taskUrl = `${baseUrl}/game/task/${taskId}`;
    
    const result = await getTaskByQrData(taskUrl);
    setIsLoading(false);

    if (result.success && result.data) {
      setTask(result.data);
      setStartTime(Date.now());
    } else {
      toast({
        title: 'Task Not Found',
        description: 'This QR code is invalid or expired',
        variant: 'destructive',
      });
    }
  };

  const handleTaskComplete = async () => {
    if (!task || isCompleting) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    setIsCompleting(true);

    // Mock sessionId and userId (replace with real auth)
    const sessionId = 'mock-session-id';
    const userId = 'mock-user-id';

    const result = await completeTask(
      task.id,
      sessionId,
      userId,
      timeTaken
    );

    setIsCompleting(false);

    if (result.success) {
      setIsCompleted(true);
      setBonusSeconds(result.data.bonusSeconds);
      toast({
        title: 'Task Completed!',
        description: `+${result.data.bonusSeconds}s power boost added!`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Task Not Found</CardTitle>
            <CardDescription>
              This QR code is invalid or the task has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex justify-center mb-4"
              >
                <CheckCircle2 className="h-24 w-24 text-green-500" />
              </motion.div>
              <CardTitle className="text-3xl">Task Complete!</CardTitle>
              <CardDescription className="text-lg">
                You've earned a power boost
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-4xl font-bold text-yellow-300">
                  +{bonusSeconds}s
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Power boost added to delay blackout
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/dashboard/groups'}
                className="w-full"
              >
                Return to Game
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{task.name}</CardTitle>
            {task.description && (
              <CardDescription className="text-base">
                {task.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mini-Game Component */}
            {task.miniGameType === 'wire_puzzle' && (
              <WirePuzzle onComplete={handleTaskComplete} />
            )}
            {task.miniGameType === 'code_entry' && (
              <CodeEntry onComplete={handleTaskComplete} />
            )}
            {task.miniGameType === 'sequence' && (
              <SequenceMatch onComplete={handleTaskComplete} />
            )}
            {!task.miniGameType && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No mini-game configured for this task
                </p>
                <Button onClick={handleTaskComplete} disabled={isCompleting}>
                  {isCompleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
