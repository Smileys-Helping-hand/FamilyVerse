'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Camera, QrCode, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPlayerTasksAction, completeTaskAction } from '@/app/actions/party-logic';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  taskId: string;
  description: string;
  pointsReward: number;
  verificationType: string;
  isCompleted: boolean;
  completedAt: Date | null;
}

interface TaskChecklistProps {
  userId: string;
}

export function TaskChecklist({ userId }: TaskChecklistProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [floatingPoints, setFloatingPoints] = useState<{ id: string; points: number }[]>([]);
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

  const handleCompleteTask = async (playerTaskId: string, pointsReward: number) => {
    setCompleting(playerTaskId);

    const result = await completeTaskAction(userId, playerTaskId);

    if (result.success) {
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

  return (
    <Card className="relative overflow-hidden">
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
                  flex items-center gap-3 p-3 rounded-lg border
                  ${task.isCompleted ? 'bg-secondary/50 border-primary/30' : 'bg-card border-border'}
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
                    onClick={() => handleCompleteTask(task.id, task.pointsReward)}
                    disabled={completing === task.id}
                  >
                    {completing === task.id ? 'Verifying...' : 'Complete'}
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
    </Card>
  );
}
