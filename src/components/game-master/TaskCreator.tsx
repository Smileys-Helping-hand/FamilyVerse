'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createTask,
  getAllTasks,
  deleteTask,
  generatePrintableQR,
} from '@/app/actions/tasks';
import { QrCode, Plus, Download, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskCreatorProps {
  eventId: number;
}

export function TaskCreator({ eventId }: TaskCreatorProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskBonus, setNewTaskBonus] = useState(120);
  const [miniGameType, setMiniGameType] = useState<'wire_puzzle' | 'code_entry' | 'sequence'>('wire_puzzle');
  
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTaskQR, setSelectedTaskQR] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, [eventId]);

  const loadTasks = async () => {
    const result = await getAllTasks(eventId);
    if (result.success) {
      setTasks(result.data);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim()) {
      toast({
        title: 'Error',
        description: 'Task name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    const result = await createTask(eventId, {
      name: newTaskName,
      description: newTaskDescription,
      taskType: 'mini_game',
      miniGameType,
      completionBonusSeconds: newTaskBonus,
    });
    setIsCreating(false);

    if (result.success) {
      setTasks([result.data.task, ...tasks]);
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskBonus(120);
      
      // Show QR code immediately
      setSelectedTaskQR(result.data.qrCodeImage);
      setQrDialogOpen(true);

      toast({
        title: 'Task Created',
        description: 'QR code generated - ready to print!',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleShowQR = async (taskId: number) => {
    const result = await generatePrintableQR(taskId, 600);
    if (result.success) {
      setSelectedTaskQR(result.data);
      setQrDialogOpen(true);
    }
  };

  const handleDownloadQR = (taskName: string) => {
    const link = document.createElement('a');
    link.download = `task-${taskName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = selectedTaskQR;
    link.click();
  };

  const handleDeleteTask = async (taskId: number) => {
    const result = await deleteTask(taskId);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({ title: 'Task Deleted' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Create New Task
          </CardTitle>
          <CardDescription>
            Generate QR codes for physical task stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name *</Label>
              <Input
                id="task-name"
                placeholder="e.g., Repair the Wi-Fi"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Power Bonus (seconds)</Label>
              <Input
                id="bonus"
                type="number"
                min={30}
                max={300}
                value={newTaskBonus}
                onChange={(e) => setNewTaskBonus(parseInt(e.target.value) || 120)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mini-game">Mini-Game Type</Label>
              <Select value={miniGameType} onValueChange={(v: any) => setMiniGameType(v)}>
                <SelectTrigger id="mini-game">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wire_puzzle">Wire Puzzle</SelectItem>
                  <SelectItem value="code_entry">Code Entry</SelectItem>
                  <SelectItem value="sequence">Sequence Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Task instructions or location hint"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleCreateTask}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                {isCreating ? 'Generating QR Code...' : 'Create Task & Generate QR'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-slate-800"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{task.name}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {task.miniGameType?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        +{task.completionBonusSeconds}s power
                      </Badge>
                      {!task.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQR(task.id)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      View QR
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Task QR Code</DialogTitle>
            <DialogDescription>
              Print this and stick it on your task station
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg">
              {selectedTaskQR && (
                <img
                  src={selectedTaskQR}
                  alt="Task QR Code"
                  className="w-full h-auto"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleDownloadQR('task')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Optimized for label makers and small printers
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
