'use client';

import { useState, useEffect } from 'react';
import {
  getEventSupplies,
  addSupplyItem,
  claimSupplyItem,
  unclaimSupplyItem,
  markSupplyBought,
  deleteSupplyItem,
} from '@/app/actions/events-extended';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Plus,
  Check,
  X,
  Package,
  User,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher/client';

const pusherClient = getPusherClient();

type EventSupply = {
  id: string;
  eventId: string;
  itemName: string;
  quantityNeeded: string;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  status: 'PENDING' | 'CLAIMED' | 'BOUGHT';
  category: string;
  notes: string | null;
  createdAt: Date;
  claimedAt: Date | null;
  boughtAt: Date | null;
};

type GroupedSupplies = {
  [category: string]: EventSupply[];
};

const CATEGORIES = [
  'Food',
  'Drinks',
  'Equipment',
  'Entertainment',
  'Safety',
  'Miscellaneous',
];

const CATEGORY_COLORS: { [key: string]: string } = {
  Food: 'bg-orange-100 text-orange-800',
  Drinks: 'bg-blue-100 text-blue-800',
  Equipment: 'bg-purple-100 text-purple-800',
  Entertainment: 'bg-pink-100 text-pink-800',
  Safety: 'bg-red-100 text-red-800',
  Miscellaneous: 'bg-gray-100 text-gray-800',
};

export default function SupplyChainTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [supplies, setSupplies] = useState<EventSupply[]>([]);
  const [grouped, setGrouped] = useState<GroupedSupplies>({});
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newItem, setNewItem] = useState({
    itemName: '',
    quantityNeeded: '',
    category: 'Food',
    notes: '',
  });

  useEffect(() => {
    loadSupplies();
  }, [eventId]);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = pusherClient.subscribe(`event-${eventId}`);

    channel.bind('supply-added', (data: EventSupply) => {
      setSupplies((prev) => [...prev, data]);
      loadSupplies(); // Refresh grouped data
    });

    channel.bind('supply-claimed', (data: EventSupply) => {
      setSupplies((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      loadSupplies();
    });

    channel.bind('supply-unclaimed', (data: EventSupply) => {
      setSupplies((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      loadSupplies();
    });

    channel.bind('supply-bought', (data: EventSupply) => {
      setSupplies((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      loadSupplies();
    });

    channel.bind('supply-deleted', ({ itemId }: { itemId: string }) => {
      setSupplies((prev) => prev.filter((s) => s.id !== itemId));
      loadSupplies();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  async function loadSupplies() {
    const result = await getEventSupplies(eventId);
    if (result.success) {
      setSupplies(result.supplies);
      setGrouped(result.grouped);
    }
    setLoading(false);
  }

  async function handleAddItem() {
    if (!newItem.itemName.trim()) return;

    await addSupplyItem({
      eventId,
      itemName: newItem.itemName,
      quantityNeeded: newItem.quantityNeeded,
      category: newItem.category,
      notes: newItem.notes || null,
      status: 'PENDING',
      assignedToUserId: null,
      assignedToUserName: null,
    });

    setNewItem({ itemName: '', quantityNeeded: '', category: 'Food', notes: '' });
    setIsAdding(false);
  }

  async function handleClaim(item: EventSupply) {
    if (!user) return;
    await claimSupplyItem(item.id, user.uid, user.displayName || 'Anonymous', eventId);
  }

  async function handleUnclaim(item: EventSupply) {
    if (!user) return;
    await unclaimSupplyItem(item.id, user.uid, eventId);
  }

  async function handleMarkBought(item: EventSupply) {
    if (!user) return;
    await markSupplyBought(item.id, user.uid, eventId);
  }

  async function handleDelete(item: EventSupply) {
    await deleteSupplyItem(item.id, eventId);
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
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Supply Chain Manager
          </h3>
          <p className="text-sm text-gray-600">
            Who's bringing what? Prevent duplicate purchases! 🛒
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add Item Form */}
      {isAdding && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <Input
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  placeholder="e.g., Boerewors, Cooldrink, Charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  value={newItem.quantityNeeded}
                  onChange={(e) => setNewItem({ ...newItem, quantityNeeded: e.target.value })}
                  placeholder="e.g., 2kg, 12 bottles, 1 bag"
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
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <Input
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Any special requirements..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supply List by Category */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No items yet</p>
            <p className="text-sm text-gray-500">
              Add supplies needed for this event to coordinate who brings what
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={CATEGORY_COLORS[category] || CATEGORY_COLORS.Miscellaneous}>
                {category}
              </Badge>
              <div className="text-sm text-gray-600">
                {items.filter((i) => i.status === 'BOUGHT').length}/{items.length} bought
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`transition-all ${
                    item.status === 'BOUGHT'
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : item.status === 'CLAIMED'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white'
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-medium ${
                              item.status === 'BOUGHT' ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {item.itemName}
                          </h4>
                          {item.status === 'BOUGHT' && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Bought
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantityNeeded}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-500 italic">{item.notes}</p>
                        )}
                        {item.assignedToUserName && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                            <User className="w-4 h-4" />
                            {item.assignedToUserName}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <Button
                            onClick={() => handleClaim(item)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            I'll Bring This
                          </Button>
                        )}

                        {item.status === 'CLAIMED' &&
                          item.assignedToUserId === user?.uid && (
                            <>
                              <Button
                                onClick={() => handleMarkBought(item)}
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Mark Bought
                              </Button>
                              <Button
                                onClick={() => handleUnclaim(item)}
                                size="sm"
                                variant="outline"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                        {item.assignedToUserId !== user?.uid && (
                          <Button
                            onClick={() => handleDelete(item)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Summary Stats */}
      {supplies.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {supplies.filter((s) => s.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Unclaimed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {supplies.filter((s) => s.status === 'CLAIMED').length}
                </div>
                <div className="text-sm text-gray-600">Claimed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {supplies.filter((s) => s.status === 'BOUGHT').length}
                </div>
                <div className="text-sm text-gray-600">Bought</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
