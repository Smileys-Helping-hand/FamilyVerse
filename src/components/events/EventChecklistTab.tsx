'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  X, 
  Calendar,
  User,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  getEventChecklists,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from '@/app/actions/event-planning';
import { useToast } from '@/hooks/use-toast';
import { getPusherClient } from '@/lib/pusher/client';

interface EventChecklistTabProps {
  eventId: string;
  eventDate: Date;
  currentUser: {
    uid: string;
    name: string;
  };
}

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  sortOrder: number;
}

const CATEGORIES = [
  { value: 'VENUE', label: 'Venue', color: 'bg-purple-100 text-purple-700' },
  { value: 'CATERING', label: 'Catering', color: 'bg-orange-100 text-orange-700' },
  { value: 'SUPPLIES', label: 'Supplies', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMMUNICATION', label: 'Communication', color: 'bg-green-100 text-green-700' },
  { value: 'GENERAL', label: 'General', color: 'bg-gray-100 text-gray-700' },
];

export default function EventChecklistTab({ eventId, eventDate, currentUser }: EventChecklistTabProps) {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    dueDate: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadChecklists();
  }, [eventId]);

  // Subscribe to Pusher updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('checklist-added', (data: any) => {
      setChecklists(prev => [...prev, data].sort((a, b) => a.sortOrder - b.sortOrder));
    });

    channel.bind('checklist-updated', (data: any) => {
      setChecklists(prev =>
        prev.map(item => (item.id === data.id ? data : item))
      );
    });

    channel.bind('checklist-deleted', (data: any) => {
      setChecklists(prev => prev.filter(item => item.id !== data.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [eventId]);

  const loadChecklists = async () => {
    setLoading(true);
    const result = await getEventChecklists(eventId);
    if (result.success) {
      setChecklists(result.checklists as any);
    }
    setLoading(false);
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    const result = await createChecklistItem({
      eventId,
      title: newItem.title,
      description: newItem.description || undefined,
      category: newItem.category as any,
      dueDate: newItem.dueDate ? new Date(newItem.dueDate) : undefined,
      sortOrder: checklists.length,
      createdBy: currentUser.uid,
      isCompleted: false,
    });

    if (result.success) {
      setNewItem({ title: '', description: '', category: 'GENERAL', dueDate: '' });
      setShowAddForm(false);
      toast({
        title: 'Added!',
        description: 'Checklist item added',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleComplete = async (item: ChecklistItem) => {
    const result = await updateChecklistItem(item.id, {
      isCompleted: !item.isCompleted,
      completedBy: !item.isCompleted ? currentUser.uid : undefined,
    });

    if (!result.success) {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this checklist item?')) return;

    const result = await deleteChecklistItem(id);
    if (!result.success) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const completedCount = checklists.filter(item => item.isCompleted).length;
  const totalCount = checklists.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group by category
  const groupedChecklists = CATEGORIES.map(category => ({
    ...category,
    items: checklists.filter(item => item.category === category.value),
  })).filter(group => group.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading checklist...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Event Planning Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} tasks completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{Math.round(progress)}%</div>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item */}
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g., Book venue, Send invitations"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newItem.dueDate}
                  onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1">
                Add Task
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ title: '', description: '', category: 'GENERAL', dueDate: '' });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Items by Category */}
      {groupedChecklists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No tasks yet. Add your first task to start planning!
            </p>
          </CardContent>
        </Card>
      ) : (
        groupedChecklists.map((group) => (
          <Card key={group.value}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge className={group.color}>{group.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({group.items.filter(i => i.isCompleted).length}/{group.items.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                    item.isCompleted ? 'bg-muted/50' : 'hover:bg-muted/30'
                  )}
                >
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="mt-1 flex-shrink-0"
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        'font-medium',
                        item.isCompleted && 'line-through text-muted-foreground'
                      )}
                    >
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(item.dueDate), 'MMM d, h:mm a')}
                        </div>
                      )}
                      {item.assignedToUserName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.assignedToUserName}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
