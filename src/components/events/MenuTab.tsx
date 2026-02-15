'use client';

import { useState, useEffect } from 'react';
import {
  getMenuItems,
  addMenuItem,
  getDietaryPreferences,
  setDietaryPreferences,
  checkDietaryConflicts,
  calculatePortions,
} from '@/app/actions/events-extended';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  UtensilsCrossed,
  Plus,
  AlertTriangle,
  ChefHat,
  Leaf,
  Pizza,
  IceCream,
  Coffee,
  User,
  Calculator,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher/client';
import { useToast } from '@/hooks/use-toast';

const pusherClient = getPusherClient();

type MenuItem = {
  id: string;
  eventId: string;
  dishName: string;
  description: string | null;
  category: 'STARTER' | 'MAIN' | 'SIDE' | 'DESSERT' | 'DRINK';
  servings: number;
  dietaryFlags: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    kosher: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    containsNuts: boolean;
    containsSeafood: boolean;
  };
  ingredients: string | null;
  preparedBy: string | null;
  notes: string | null;
  createdAt: Date;
};

type GroupedMenu = {
  [category: string]: MenuItem[];
};

const CATEGORIES = [
  { value: 'STARTER', label: 'Starter', icon: '🥗' },
  { value: 'MAIN', label: 'Main Course', icon: '🍖' },
  { value: 'SIDE', label: 'Side Dish', icon: '🍚' },
  { value: 'DESSERT', label: 'Dessert', icon: '🍰' },
  { value: 'DRINK', label: 'Drinks', icon: '🥤' },
];

const DIETARY_FLAGS = [
  { key: 'vegetarian', label: 'Vegetarian', icon: '🥬', color: 'bg-green-100 text-green-800' },
  { key: 'vegan', label: 'Vegan', icon: '🌱', color: 'bg-green-100 text-green-800' },
  { key: 'halal', label: 'Halal', icon: '☪️', color: 'bg-blue-100 text-blue-800' },
  { key: 'kosher', label: 'Kosher', icon: '✡️', color: 'bg-blue-100 text-blue-800' },
  { key: 'glutenFree', label: 'Gluten Free', icon: '🚫🌾', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'dairyFree', label: 'Dairy Free', icon: '🚫🥛', color: 'bg-yellow-100 text-yellow-800' },
];

const WARNING_FLAGS = [
  { key: 'containsNuts', label: 'Contains Nuts', icon: '🥜', color: 'bg-red-100 text-red-800' },
  {
    key: 'containsSeafood',
    label: 'Contains Seafood',
    icon: '🦐',
    color: 'bg-red-100 text-red-800',
  },
];

export default function MenuTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [grouped, setGrouped] = useState<GroupedMenu>({});
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [portions, setPortions] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newItem, setNewItem] = useState({
    dishName: '',
    description: '',
    category: 'MAIN',
    servings: '6',
    ingredients: '',
    preparedBy: '',
    notes: '',
  });

  const [dietaryFlags, setDietaryFlags] = useState({
    vegetarian: false,
    vegan: false,
    halal: false,
    kosher: false,
    glutenFree: false,
    dairyFree: false,
    containsNuts: false,
    containsSeafood: false,
  });

  useEffect(() => {
    loadMenu();
    loadConflicts();
    loadPortions();
  }, [eventId]);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = pusherClient.subscribe(`event-${eventId}`);

    channel.bind('menu-item-added', (data: MenuItem) => {
      setMenuItems((prev) => [...prev, data]);
      loadMenu(); // Refresh grouped data
      loadConflicts(); // Check for new conflicts
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  async function loadMenu() {
    const result = await getMenuItems(eventId);
    if (result.success) {
      setMenuItems(result.items);
      setGrouped(result.grouped);
    }
    setLoading(false);
  }

  async function loadConflicts() {
    const result = await checkDietaryConflicts(eventId);
    if (result.success) {
      setConflicts(result.conflicts);
    }
  }

  async function loadPortions() {
    const result = await calculatePortions(eventId);
    if (result.success) {
      setPortions(result.portions);
    }
  }

  async function handleAddItem() {
    if (!user || !newItem.dishName.trim()) return;

    await addMenuItem({
      eventId,
      dishName: newItem.dishName,
      description: newItem.description || null,
      category: newItem.category as any,
      servings: parseInt(newItem.servings) || 6,
      dietaryFlags,
      ingredients: newItem.ingredients || null,
      preparedBy: newItem.preparedBy || user.displayName || 'Anonymous',
      notes: newItem.notes || null,
    });

    // Reset form
    setNewItem({
      dishName: '',
      description: '',
      category: 'MAIN',
      servings: '6',
      ingredients: '',
      preparedBy: '',
      notes: '',
    });
    setDietaryFlags({
      vegetarian: false,
      vegan: false,
      halal: false,
      kosher: false,
      glutenFree: false,
      dairyFree: false,
      containsNuts: false,
      containsSeafood: false,
    });
    setIsAdding(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-600" />
            Feast Manager
          </h3>
          <p className="text-sm text-gray-600">
            Plan the menu and track dietary requirements 🍽️
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Dish
        </Button>
      </div>

      {/* Dietary Conflicts Warning */}
      {conflicts.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dietary Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-red-200">
                <p className="font-medium text-red-800">
                  {conflict.userName} - {conflict.issue}
                </p>
                {conflict.affectedDishes && (
                  <p className="text-sm text-gray-600 mt-1">
                    Affected dishes: {conflict.affectedDishes.join(', ')}
                  </p>
                )}
                {conflict.note && (
                  <p className="text-sm text-gray-600 mt-1">{conflict.note}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Portion Calculator */}
      {portions && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Estimated Portions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {portions.attendees}
                </div>
                <div className="text-xs text-gray-600">Attendees</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{portions.meat}</div>
                <div className="text-xs text-gray-600">Meat</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{portions.rice}</div>
                <div className="text-xs text-gray-600">Rice</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{portions.salad}</div>
                <div className="text-xs text-gray-600">Salad</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{portions.drinks}</div>
                <div className="text-xs text-gray-600">Drinks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item Form */}
      {isAdding && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Dish Name</label>
                <Input
                  value={newItem.dishName}
                  onChange={(e) => setNewItem({ ...newItem, dishName: e.target.value })}
                  placeholder="e.g., Braai Boerewors, Potato Salad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
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
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Servings</label>
                <Input
                  type="number"
                  value={newItem.servings}
                  onChange={(e) => setNewItem({ ...newItem, servings: e.target.value })}
                  placeholder="6"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Ingredients</label>
                <Textarea
                  value={newItem.ingredients}
                  onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
                  placeholder="List main ingredients..."
                />
              </div>

              {/* Dietary Flags */}
              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium mb-2">Dietary Information</label>
                <div className="grid grid-cols-2 gap-2">
                  {[...DIETARY_FLAGS, ...WARNING_FLAGS].map((flag) => (
                    <div key={flag.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={flag.key}
                        checked={(dietaryFlags as any)[flag.key]}
                        onCheckedChange={(checked) =>
                          setDietaryFlags({ ...dietaryFlags, [flag.key]: checked })
                        }
                      />
                      <label htmlFor={flag.key} className="text-sm cursor-pointer">
                        {flag.icon} {flag.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Dish
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items by Category */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No menu items yet</p>
            <p className="text-sm text-gray-500">
              Add dishes to plan the meal and check for dietary conflicts
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => {
          const categoryInfo = CATEGORIES.find((c) => c.value === category);
          return (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {categoryInfo?.icon} {categoryInfo?.label}
              </h4>

              <div className="grid gap-3">
                {items.map((item) => (
                  <Card key={item.id} className="border-orange-200">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-lg">{item.dishName}</h5>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Prepared by: {item.preparedBy || 'Unknown'}</span>
                            <span className="ml-2">• Serves {item.servings}</span>
                          </div>

                          {/* Dietary Badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {[...DIETARY_FLAGS, ...WARNING_FLAGS].map((flag) => {
                              if ((item.dietaryFlags as any)[flag.key]) {
                                return (
                                  <Badge key={flag.key} className={flag.color}>
                                    {flag.icon} {flag.label}
                                  </Badge>
                                );
                              }
                              return null;
                            })}
                          </div>

                          {item.ingredients && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Ingredients: {item.ingredients}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
