'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Camera, QrCode, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPlayerTasksAction, completeTaskAction } from '@/app/actions/party-logic';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  taskId: string;
  description: string;
  pointsReward: number;
  verificationType: string;
  qrCode?: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
}

interface TaskChecklistProps {
  userId: string;
  role: 'CREWMATE' | 'IMPOSTER' | 'UNKNOWN';
}

const HOLD_DURATION_MS = 1500;

export function TaskChecklist({ userId, role }: TaskChecklistProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<{ id: string; points: number }[]>([]);
  const [qrTask, setQrTask] = useState<Task | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const vibrateIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    const result = await getPlayerTasksAction(userId);
    if (result.success && result.tasks) {
      setTasks(result.tasks as Task[]);
    }
    setLoading(false);
  };

  const handleCompleteTask = async (playerTaskId: string, pointsReward: number, proof?: string) => {
    setCompleting(playerTaskId);

    const result = await completeTaskAction(userId, playerTaskId, proof);

    if (result.success) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#7dd3fc', '#22c55e', '#facc15'],
        scalar: 0.8,
      });

      // Show floating points animation
      setFloatingPoints((prev) => [...prev, { id: playerTaskId, points: pointsReward }]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== playerTaskId));
      }, 2000);

      toast({
        title: '✅ Task Complete!',
        description: `+${pointsReward} Points | ${result.completionRate?.toFixed(0)}% Progress`,
      });

      await loadTasks();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setCompleting(null);
  };

  const getIcon = (verificationType: string) => {
    switch (verificationType) {
      case 'PHOTO':
        return <Camera className="w-4 h-4" />;
      case 'QR_SCAN':
        return <QrCode className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const startHold = (task: Task) => {
    if (completing || task.isCompleted) {
      return;
    }

    if (holdingTaskId && holdingTaskId !== task.id) {
      endHold();
    }

    setHoldingTaskId(task.id);
    setHoldProgress(0);

    const startTime = Date.now();
    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(progress);
    }, 40);

    holdTimerRef.current = window.setTimeout(async () => {
      if (task.verificationType === 'QR_SCAN') {
        setQrTask(task);
        setQrInput('');
      } else {
        await handleCompleteTask(task.id, task.pointsReward);
      }
      endHold();
    }, HOLD_DURATION_MS);

    if (navigator.vibrate) {
      navigator.vibrate(20);
      vibrateIntervalRef.current = window.setInterval(() => {
        navigator.vibrate(20);
      }, 200);
    }
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      window.clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    setHoldingTaskId(null);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      endHold();
    };
  }, []);

  const glowBorder =
    role === 'IMPOSTER'
      ? 'border-red-500/60 shadow-[0_0_18px_rgba(248,113,113,0.35)]'
      : role === 'CREWMATE'
      ? 'border-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.35)]'
      : 'border-white/20';

  return (
    <Card className={`relative overflow-hidden bg-white/5 backdrop-blur-md ${glowBorder}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            ⚡ Crewmate Tasks
            <Badge variant="secondary">
              {completedCount}/{totalCount}
            </Badge>
          </CardTitle>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No tasks assigned yet. Wait for the host to start the game!
          </p>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              className="relative"
            >
              <div
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition
                  ${task.isCompleted ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}
                `}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 ${task.isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      task.isCompleted ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getIcon(task.verificationType)}
                      <span className="ml-1">{task.verificationType}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">+{task.pointsReward} 🪙</span>
                  </div>
                </div>

                {/* Action Button */}
                {!task.isCompleted && (
                  <Button
                    size="sm"
                    className="relative overflow-hidden"
                    onPointerDown={() => startHold(task)}
                    onPointerUp={endHold}
                    onPointerLeave={endHold}
                    onPointerCancel={endHold}
                    disabled={completing === task.id}
                  >
                    {completing === task.id
                      ? 'Verifying...'
                      : task.verificationType === 'QR_SCAN'
                      ? 'Hold to Scan'
                      : 'Hold to Complete'}
                    {holdingTaskId === task.id && (
                      <svg
                        className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2"
                        viewBox="0 0 36 36"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="3"
                          fill="transparent"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          stroke="rgba(59,130,246,0.9)"
                          strokeWidth="3"
                          strokeDasharray={100}
                          strokeDashoffset={100 - holdProgress * 100}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </Button>
                )}
              </div>

              {/* Floating Points Animation */}
              <AnimatePresence>
                {floatingPoints.find((p) => p.id === task.id) && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -50, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute -top-2 right-4 text-2xl font-bold text-primary pointer-events-none"
                  >
                    +{task.pointsReward} 🪙
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </CardContent>

      <Dialog
        open={!!qrTask}
        onOpenChange={(open) => {
          if (!open) {
            setQrTask(null);
            setQrInput('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Task QR</DialogTitle>
            <DialogDescription>
              Enter the QR code from the station to complete this task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Enter QR code"
              value={qrInput}
              onChange={(event) => setQrInput(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!qrTask) {
                  return;
                }
                if (!qrTask.qrCode || qrInput.trim() !== qrTask.qrCode) {
                  toast({
                    title: '❌ Invalid Code',
                    description: 'That QR code does not match this task.',
                    variant: 'destructive',
                  });
                  return;
                }
                await handleCompleteTask(qrTask.id, qrTask.pointsReward, qrInput.trim());
                setQrTask(null);
                setQrInput('');
              }}
            >
              Verify Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
