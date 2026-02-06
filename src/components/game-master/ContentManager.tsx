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
  getImposterHints,
  getCivilianTopics,
  addImposterHint,
  addCivilianTopic,
  updateImposterHint,
  updateCivilianTopic,
  deleteImposterHint,
  deleteCivilianTopic,
} from '@/app/actions/game-master';
import { MessageSquare, Users, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContentManagerProps {
  eventId: number;
}

export function ContentManager({ eventId }: ContentManagerProps) {
  const { toast } = useToast();
  const [hints, setHints] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  const [newHint, setNewHint] = useState('');
  const [newHintCategory, setNewHintCategory] = useState<'general' | 'action' | 'behavior'>('general');
  
  const [newTopic, setNewTopic] = useState('');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    loadContent();
  }, [eventId]);

  const loadContent = async () => {
    const [hintsResult, topicsResult] = await Promise.all([
      getImposterHints(eventId),
      getCivilianTopics(eventId),
    ]);

    if (hintsResult.success) setHints(hintsResult.data);
    if (topicsResult.success) setTopics(topicsResult.data);
  };

  const handleAddHint = async () => {
    if (!newHint.trim()) return;

    const result = await addImposterHint(eventId, newHint, newHintCategory);
    if (result.success) {
      setHints([result.data, ...hints]);
      setNewHint('');
      toast({
        title: 'Hint Added',
        description: 'New imposter hint created successfully',
      });
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;

    const result = await addCivilianTopic(eventId, newTopic, newTopicDifficulty);
    if (result.success) {
      setTopics([result.data, ...topics]);
      setNewTopic('');
      toast({
        title: 'Topic Added',
        description: 'New civilian topic created successfully',
      });
    }
  };

  const handleToggleHintActive = async (hintId: number, currentState: boolean) => {
    const result = await updateImposterHint(hintId, { isActive: !currentState });
    if (result.success) {
      setHints(hints.map(h => h.id === hintId ? result.data : h));
      toast({
        title: currentState ? 'Hint Disabled' : 'Hint Enabled',
      });
    }
  };

  const handleToggleTopicActive = async (topicId: number, currentState: boolean) => {
    const result = await updateCivilianTopic(topicId, { isActive: !currentState });
    if (result.success) {
      setTopics(topics.map(t => t.id === topicId ? result.data : t));
      toast({
        title: currentState ? 'Topic Disabled' : 'Topic Enabled',
      });
    }
  };

  const handleDeleteHint = async (hintId: number) => {
    const result = await deleteImposterHint(hintId);
    if (result.success) {
      setHints(hints.filter(h => h.id !== hintId));
      toast({ title: 'Hint Deleted' });
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    const result = await deleteCivilianTopic(topicId);
    if (result.success) {
      setTopics(topics.filter(t => t.id !== topicId));
      toast({ title: 'Topic Deleted' });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Imposter Hints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            Imposter Hints
          </CardTitle>
          <CardDescription>
            Clues shown to the imposter to help them blend in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Hint */}
          <div className="space-y-2 p-4 border rounded-lg bg-slate-900/50">
            <Label>Add New Hint</Label>
            <Textarea
              placeholder="e.g., Act confused when asked specific questions"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Select value={newHintCategory} onValueChange={(v: any) => setNewHintCategory(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddHint} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Hint
              </Button>
            </div>
          </div>

          {/* Hints List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hints.map((hint) => (
              <div
                key={hint.id}
                className={`p-3 border rounded-lg ${
                  hint.isActive ? 'bg-slate-800' : 'bg-slate-900/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">{hint.hintText}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {hint.category}
                      </Badge>
                      {!hint.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleHintActive(hint.id, hint.isActive)}
                    >
                      {hint.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Hint?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this hint.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteHint(hint.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            {hints.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No hints yet. Add your first one above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Civilian Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Civilian Topics
          </CardTitle>
          <CardDescription>
            Conversation topics for civilians to discuss
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Topic */}
          <div className="space-y-2 p-4 border rounded-lg bg-slate-900/50">
            <Label>Add New Topic</Label>
            <Textarea
              placeholder="e.g., Best vacation you've ever had"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Select value={newTopicDifficulty} onValueChange={(v: any) => setNewTopicDifficulty(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddTopic} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Topic
              </Button>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`p-3 border rounded-lg ${
                  topic.isActive ? 'bg-slate-800' : 'bg-slate-900/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">{topic.topicText}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge 
                        variant={
                          topic.difficulty === 'hard' 
                            ? 'destructive' 
                            : topic.difficulty === 'medium' 
                            ? 'default' 
                            : 'secondary'
                        } 
                        className="text-xs"
                      >
                        {topic.difficulty}
                      </Badge>
                      {!topic.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleTopicActive(topic.id, topic.isActive)}
                    >
                      {topic.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this topic.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTopic(topic.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No topics yet. Add your first one above!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
