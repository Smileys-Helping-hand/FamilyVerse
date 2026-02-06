'use client';

import { useState } from 'react';
import { ChecklistItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, User, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChecklistManagerProps {
  groupId: number;
  items: ChecklistItem[];
  onUpdate?: () => void;
}

export function ChecklistManager({ groupId, items, onUpdate }: ChecklistManagerProps) {
  const { toast } = useToast();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [filter, setFilter] = useState<'all' | 'packing' | 'todo' | 'shopping' | 'other'>('all');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'packing' as const,
    priority: 'medium' as const,
    dueDate: undefined as Date | undefined,
  });

  const handleAddItem = () => {
    if (!newItem.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for the item.",
        variant: "destructive",
      });
      return;
    }

    // Here you would save to Firebase
    toast({
      title: "Item Added",
      description: `"${newItem.title}" has been added to the checklist.`,
    });

    setNewItem({
      title: '',
      description: '',
      category: 'packing',
      priority: 'medium',
      dueDate: undefined,
    });
    setIsAddingItem(false);
    if (onUpdate) onUpdate();
  };

  const handleToggleComplete = (itemId: number, completed: boolean) => {
    // Here you would update Postgres
    toast({
      description: completed ? "Item marked as complete" : "Item marked as incomplete",
    });
    if (onUpdate) onUpdate();
  };

  const handleDeleteItem = (itemId: number) => {
    // Here you would delete from Postgres
    toast({
      description: "Item deleted from checklist",
    });
    if (onUpdate) onUpdate();
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'low': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'packing': return '🎒';
      case 'todo': return '✓';
      case 'shopping': return '🛒';
      default: return '📝';
    }
  };

  const stats = {
    total: items.length,
    completed: items.filter(i => i.completed).length,
    pending: items.filter(i => !i.completed).length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>
              {stats.completed} of {stats.total} items completed
            </CardDescription>
          </div>
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Checklist Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your group's checklist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-title">Title *</Label>
                  <Input
                    id="item-title"
                    placeholder="e.g., Pack sunscreen"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    placeholder="Additional details..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newItem.category} onValueChange={(value: any) => setNewItem({ ...newItem, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="packing">🎒 Packing</SelectItem>
                        <SelectItem value="todo">✓ To Do</SelectItem>
                        <SelectItem value="shopping">🛒 Shopping</SelectItem>
                        <SelectItem value="other">📝 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newItem.priority} onValueChange={(value: any) => setNewItem({ ...newItem, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newItem.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newItem.dueDate ? format(newItem.dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newItem.dueDate}
                        onSelect={(date) => setNewItem({ ...newItem, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({items.length})
          </Button>
          <Button
            variant={filter === 'packing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('packing')}
          >
            🎒 Packing ({items.filter(i => i.category === 'packing').length})
          </Button>
          <Button
            variant={filter === 'todo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('todo')}
          >
            ✓ To Do ({items.filter(i => i.category === 'todo').length})
          </Button>
          <Button
            variant={filter === 'shopping' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('shopping')}
          >
            🛒 Shopping ({items.filter(i => i.category === 'shopping').length})
          </Button>
          <Button
            variant={filter === 'other' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('other')}
          >
            📝 Other ({items.filter(i => i.category === 'other').length})
          </Button>
        </div>

        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items in this category yet.</p>
              <p className="text-sm">Click "Add Item" to get started!</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors",
                  item.completed && "opacity-60"
                )}
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => handleToggleComplete(item.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", item.completed && "line-through")}>
                      {getCategoryIcon(item.category)} {item.title}
                    </span>
                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                      {item.priority}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Assigned
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(item.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
