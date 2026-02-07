'use client';

import { useState } from 'react';
import { Recommendation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, ThumbsUp, ThumbsDown, ExternalLink, MapPin, DollarSign, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  addRecommendationAction,
  deleteRecommendationAction,
  voteRecommendationAction,
} from '@/app/actions/groups';

interface RecommendationsManagerProps {
  groupId: number;
  recommendations: Recommendation[];
  currentUserId: string;
  onUpdate?: () => void;
}

export function RecommendationsManager({ 
  groupId, 
  recommendations, 
  currentUserId,
  onUpdate 
}: RecommendationsManagerProps) {
  const { toast } = useToast();
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [filter, setFilter] = useState<'all' | 'activity' | 'restaurant' | 'accommodation' | 'attraction' | 'other'>('all');
  const [newRec, setNewRec] = useState({
    type: 'activity' as const,
    title: '',
    description: '',
    location: '',
    url: '',
    price: '' as '' | '$' | '$$' | '$$$' | '$$$$',
    notes: '',
  });

  const handleAddRecommendation = async () => {
    if (!newRec.title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for the recommendation.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to add recommendations.",
        variant: "destructive",
      });
      return;
    }

    const result = await addRecommendationAction({
      groupId: String(groupId),
      type: newRec.type,
      title: newRec.title.trim(),
      description: newRec.description.trim() || 'Recommendation',
      location: newRec.location.trim() || undefined,
      url: newRec.url.trim() || undefined,
      price: newRec.price || undefined,
      notes: newRec.notes.trim() || undefined,
      suggestedBy: currentUserId,
    });

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to add recommendation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recommendation Added",
      description: `"${newRec.title}" has been added to recommendations.`,
    });

    setNewRec({
      type: 'activity',
      title: '',
      description: '',
      location: '',
      url: '',
      price: '',
      notes: '',
    });
    setIsAddingRec(false);
    if (onUpdate) onUpdate();
  };

  const handleVote = async (recId: number, vote: 'up' | 'down') => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    const result = await voteRecommendationAction(String(recId), currentUserId, vote);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to update vote.",
        variant: "destructive",
      });
      return;
    }

    toast({
      description: vote === 'up' ? "Vote added" : "Vote removed",
    });
    if (onUpdate) onUpdate();
  };

  const handleDelete = async (recId: number) => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to delete recommendations.",
        variant: "destructive",
      });
      return;
    }

    const result = await deleteRecommendationAction(String(recId));
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to delete recommendation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      description: "Recommendation deleted",
    });
    if (onUpdate) onUpdate();
  };

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎯';
      case 'restaurant': return '🍽️';
      case 'accommodation': return '🏨';
      case 'attraction': return '🎡';
      default: return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity': return 'bg-blue-500/10 text-blue-500';
      case 'restaurant': return 'bg-orange-500/10 text-orange-500';
      case 'accommodation': return 'bg-purple-500/10 text-purple-500';
      case 'attraction': return 'bg-pink-500/10 text-pink-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getVoteCount = (rec: Recommendation) => {
    const upvotes = rec.votes?.filter(v => v.vote === 'up').length || 0;
    const downvotes = rec.votes?.filter(v => v.vote === 'down').length || 0;
    return upvotes - downvotes;
  };

  const hasUserVoted = (rec: Recommendation) => {
    return rec.votes?.find(v => v.userId === currentUserId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Share and vote on places to visit, things to do, and where to eat
            </CardDescription>
          </div>
          <Dialog open={isAddingRec} onOpenChange={setIsAddingRec}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Recommendation</DialogTitle>
                <DialogDescription>
                  Share a place, activity, or attraction with your group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="rec-type">Type</Label>
                  <Select value={newRec.type} onValueChange={(value: any) => setNewRec({ ...newRec, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">🎯 Activity</SelectItem>
                      <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                      <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                      <SelectItem value="attraction">🎡 Attraction</SelectItem>
                      <SelectItem value="other">💡 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-title">Title *</Label>
                  <Input
                    id="rec-title"
                    placeholder="e.g., The Mountain View Cafe"
                    value={newRec.title}
                    onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-description">Description</Label>
                  <Textarea
                    id="rec-description"
                    placeholder="What makes this place special?"
                    value={newRec.description}
                    onChange={(e) => setNewRec({ ...newRec, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rec-location">Location</Label>
                    <Input
                      id="rec-location"
                      placeholder="Address or area"
                      value={newRec.location}
                      onChange={(e) => setNewRec({ ...newRec, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rec-price">Price Range</Label>
                    <Select value={newRec.price} onValueChange={(value: any) => setNewRec({ ...newRec, price: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ Budget</SelectItem>
                        <SelectItem value="$$">$$ Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ Expensive</SelectItem>
                        <SelectItem value="$$$$">$$$$ Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-url">Website / Link</Label>
                  <Input
                    id="rec-url"
                    type="url"
                    placeholder="https://example.com"
                    value={newRec.url}
                    onChange={(e) => setNewRec({ ...newRec, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-notes">Additional Notes</Label>
                  <Textarea
                    id="rec-notes"
                    placeholder="Any tips or things to know?"
                    value={newRec.notes}
                    onChange={(e) => setNewRec({ ...newRec, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingRec(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecommendation}>Add Recommendation</Button>
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
            All ({recommendations.length})
          </Button>
          <Button
            variant={filter === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('activity')}
          >
            🎯 Activities ({recommendations.filter(r => r.type === 'activity').length})
          </Button>
          <Button
            variant={filter === 'restaurant' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('restaurant')}
          >
            🍽️ Restaurants ({recommendations.filter(r => r.type === 'restaurant').length})
          </Button>
          <Button
            variant={filter === 'accommodation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('accommodation')}
          >
            🏨 Stays ({recommendations.filter(r => r.type === 'accommodation').length})
          </Button>
          <Button
            variant={filter === 'attraction' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('attraction')}
          >
            🎡 Attractions ({recommendations.filter(r => r.type === 'attraction').length})
          </Button>
        </div>

        <div className="space-y-3">
          {filteredRecs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recommendations yet.</p>
              <p className="text-sm">Be the first to add one!</p>
            </div>
          ) : (
            filteredRecs
              .sort((a, b) => getVoteCount(b) - getVoteCount(a))
              .map((rec) => {
                const voteCount = getVoteCount(rec);
                const userVote = hasUserVoted(rec);
                
                return (
                  <Card key={rec.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <Button
                            variant={userVote?.vote === 'up' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleVote(rec.id, 'up')}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <span className={cn(
                            "text-lg font-bold",
                            voteCount > 0 && "text-green-500",
                            voteCount < 0 && "text-red-500"
                          )}>
                            {voteCount}
                          </span>
                          <Button
                            variant={userVote?.vote === 'down' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleVote(rec.id, 'down')}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {getTypeIcon(rec.type)} {rec.title}
                                </h4>
                                <Badge className={getTypeColor(rec.type)} variant="outline">
                                  {rec.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                            {rec.suggestedBy === currentUserId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(rec.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {rec.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {rec.location}
                              </span>
                            )}
                            {rec.price && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {rec.price}
                              </span>
                            )}
                            {rec.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {rec.rating}/5
                              </span>
                            )}
                            {rec.url && (
                              <a 
                                href={rec.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                Visit Website
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          
                          {rec.notes && (
                            <div className="p-2 bg-muted/50 rounded text-sm">
                              <strong>Note:</strong> {rec.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
