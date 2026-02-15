'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getHeritageItems,
  createHeritageItem,
  likeHeritageItem,
} from '@/app/actions/heritage-vault';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getPusherClient } from '@/lib/pusher/client';
import {
  BookOpen,
  ChefHat,
  Heart,
  Plus,
  Clock,
  Users,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

const pusherClient = getPusherClient();

export default function HeritageVaultPage() {
  const { user, userProfile, family } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'RECIPE' | 'STORY' | 'TRADITION'>('ALL');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    type: 'RECIPE' as 'RECIPE' | 'STORY' | 'TRADITION',
    content: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    ingredients: [{ item: '', amount: '' }],
    steps: [''],
  });

  useEffect(() => {
    loadItems();
  }, [filter]);

  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe('heritage-vault');

    channel.bind('item-created', () => {
      loadItems();
      toast({
        title: 'New Heritage Item',
        description: 'A new item was added to the vault',
      });
    });

    channel.bind('item-liked', () => {
      loadItems();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe('heritage-vault');
    };
  }, [user]);

  async function loadItems() {
    const filterType = filter === 'ALL' ? undefined : filter;
    const result = await getHeritageItems({
      type: filterType,
      familyId: family?.id,
    });

    if (result.success) {
      setItems(result.items);
    }
    setLoading(false);
  }

  async function handleCreate() {
    if (!user || !userProfile) return;

    const ingredients =
      createForm.type === 'RECIPE'
        ? createForm.ingredients.filter((i) => i.item.trim())
        : undefined;

    const steps =
      createForm.type === 'RECIPE'
        ? createForm.steps.filter((s) => s.trim())
        : undefined;

    const result = await createHeritageItem({
      title: createForm.title,
      type: createForm.type,
      content: createForm.content,
      contributorId: user.uid,
      contributorName: userProfile.name || user.displayName || 'Anonymous',
      familyId: family?.id,
      visibility: 'FAMILY_ONLY',
      prepTime: createForm.prepTime ? parseInt(createForm.prepTime) : undefined,
      cookTime: createForm.cookTime ? parseInt(createForm.cookTime) : undefined,
      servings: createForm.servings ? parseInt(createForm.servings) : undefined,
      difficulty: createForm.type === 'RECIPE' ? createForm.difficulty : undefined,
      ingredients,
      steps,
    });

    if (result.success) {
      toast({
        title: 'Created!',
        description: `${createForm.title} was added to the Heritage Vault`,
      });
      setShowCreateDialog(false);
      setCreateForm({
        title: '',
        type: 'RECIPE',
        content: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'MEDIUM',
        ingredients: [{ item: '', amount: '' }],
        steps: [''],
      });
      loadItems();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  async function handleLike(itemId: string) {
    if (!user) return;
    await likeHeritageItem(itemId, user.uid);
    loadItems();
  }

  function addIngredient() {
    setCreateForm({
      ...createForm,
      ingredients: [...createForm.ingredients, { item: '', amount: '' }],
    });
  }

  function addStep() {
    setCreateForm({
      ...createForm,
      steps: [...createForm.steps, ''],
    });
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the Heritage Vault</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-600" />
            Heritage Vault
          </h1>
          <p className="text-gray-600 mt-2">
            Preserve your family's recipes, stories, and traditions for generations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add to Vault
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to Heritage Vault</DialogTitle>
              <DialogDescription>
                Share a recipe, story, or family tradition
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value: any) =>
                    setCreateForm({ ...createForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECIPE">🍽️ Recipe</SelectItem>
                    <SelectItem value="STORY">📖 Story</SelectItem>
                    <SelectItem value="TRADITION">🎉 Tradition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder={
                    createForm.type === 'RECIPE'
                      ? "Grandma's Secret Breyani"
                      : 'The Great Family Road Trip of 2020'
                  }
                />
              </div>

              {createForm.type === 'RECIPE' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Prep Time (min)</Label>
                      <Input
                        type="number"
                        value={createForm.prepTime}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, prepTime: e.target.value })
                        }
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label>Cook Time (min)</Label>
                      <Input
                        type="number"
                        value={createForm.cookTime}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, cookTime: e.target.value })
                        }
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label>Servings</Label>
                      <Input
                        type="number"
                        value={createForm.servings}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, servings: e.target.value })
                        }
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={createForm.difficulty}
                      onValueChange={(value: any) =>
                        setCreateForm({ ...createForm, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ingredients</Label>
                    {createForm.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 mt-2">
                        <Input
                          value={ing.item}
                          onChange={(e) => {
                            const newIngredients = [...createForm.ingredients];
                            newIngredients[idx].item = e.target.value;
                            setCreateForm({ ...createForm, ingredients: newIngredients });
                          }}
                          placeholder="Rice"
                          className="flex-1"
                        />
                        <Input
                          value={ing.amount}
                          onChange={(e) => {
                            const newIngredients = [...createForm.ingredients];
                            newIngredients[idx].amount = e.target.value;
                            setCreateForm({ ...createForm, ingredients: newIngredients });
                          }}
                          placeholder="2 cups"
                          className="w-32"
                        />
                      </div>
                    ))}
                    <Button onClick={addIngredient} variant="outline" size="sm" className="mt-2">
                      + Add Ingredient
                    </Button>
                  </div>

                  <div>
                    <Label>Steps</Label>
                    {createForm.steps.map((step, idx) => (
                      <Textarea
                        key={idx}
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...createForm.steps];
                          newSteps[idx] = e.target.value;
                          setCreateForm({ ...createForm, steps: newSteps });
                        }}
                        placeholder={`Step ${idx + 1}`}
                        className="mt-2"
                        rows={2}
                      />
                    ))}
                    <Button onClick={addStep} variant="outline" size="sm" className="mt-2">
                      + Add Step
                    </Button>
                  </div>
                </>
              )}

              <div>
                <Label>
                  {createForm.type === 'RECIPE' ? 'Description' : 'Content'} *
                </Label>
                <Textarea
                  value={createForm.content}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, content: e.target.value })
                  }
                  placeholder={
                    createForm.type === 'RECIPE'
                      ? 'The secret to this dish is...'
                      : 'Tell your story...'
                  }
                  rows={6}
                />
              </div>

              <Button onClick={handleCreate} className="w-full">
                Add to Vault
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="mb-6">
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="RECIPE">🍽️ Recipes</TabsTrigger>
          <TabsTrigger value="STORY">📖 Stories</TabsTrigger>
          <TabsTrigger value="TRADITION">🎉 Traditions</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No items in the vault yet</p>
            <p className="text-sm text-gray-500">
              Start preserving your family's heritage by adding recipes and stories!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {item.type === 'RECIPE' && '🍽️ Recipe'}
                      {item.type === 'STORY' && '📖 Story'}
                      {item.type === 'TRADITION' && '🎉 Tradition'}
                    </Badge>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      by {item.contributorName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.type === 'RECIPE' && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {item.prepTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.prepTime + item.cookTime}m
                      </span>
                    )}
                    {item.servings && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {item.servings}
                      </span>
                    )}
                    {item.difficulty && (
                      <Badge variant="secondary" className="text-xs">
                        {item.difficulty}
                      </Badge>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(item.id);
                    }}
                    className={
                      item.likedBy?.includes(user?.uid) ? 'text-red-600' : ''
                    }
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${
                        item.likedBy?.includes(user?.uid) ? 'fill-current' : ''
                      }`}
                    />
                    {item.likes}
                  </Button>
                  <span className="text-xs text-gray-500">{item.views} views</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Detail Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {selectedItem.type === 'RECIPE' && '🍽️ Recipe'}
                    {selectedItem.type === 'STORY' && '📖 Story'}
                    {selectedItem.type === 'TRADITION' && '🎉 Tradition'}
                  </Badge>
                  <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
                  <DialogDescription>by {selectedItem.contributorName}</DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(selectedItem.id);
                  }}
                  className={
                    selectedItem.likedBy?.includes(user?.uid) ? 'text-red-600' : ''
                  }
                >
                  <Heart
                    className={`w-5 h-5 ${
                      selectedItem.likedBy?.includes(user?.uid) ? 'fill-current' : ''
                    }`}
                  />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {selectedItem.type === 'RECIPE' && (
                <>
                  <div className="flex gap-6 text-sm">
                    {selectedItem.prepTime && (
                      <div>
                        <p className="text-gray-500">Prep</p>
                        <p className="font-semibold">{selectedItem.prepTime} min</p>
                      </div>
                    )}
                    {selectedItem.cookTime && (
                      <div>
                        <p className="text-gray-500">Cook</p>
                        <p className="font-semibold">{selectedItem.cookTime} min</p>
                      </div>
                    )}
                    {selectedItem.servings && (
                      <div>
                        <p className="text-gray-500">Servings</p>
                        <p className="font-semibold">{selectedItem.servings}</p>
                      </div>
                    )}
                    {selectedItem.difficulty && (
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <Badge>{selectedItem.difficulty}</Badge>
                      </div>
                    )}
                  </div>

                  {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                      <ul className="space-y-2">
                        {selectedItem.ingredients.map((ing: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                            <span className="font-medium">{ing.amount}</span>
                            <span>{ing.item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedItem.steps && selectedItem.steps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                      <ol className="space-y-4">
                        {selectedItem.steps.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold">
                              {idx + 1}
                            </span>
                            <p className="pt-1">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">
                  {selectedItem.type === 'RECIPE' ? 'Description' : 'Story'}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
