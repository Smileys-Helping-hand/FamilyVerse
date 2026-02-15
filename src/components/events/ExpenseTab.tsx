'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, DollarSign, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  addExpense,
  getEventExpenses,
  getSettlementSummary,
  settleExpense,
  getEventAttendees,
} from '@/app/actions/events';
import { getPusherClient } from '@/lib/pusher/client';

interface ExpenseTabProps {
  eventId: string;
  currentUser: {
    uid: string;
    name: string;
  };
}

export function ExpenseTab({ eventId, currentUser }: ExpenseTabProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any>({});
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const { toast } = useToast();

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [splitType, setSplitType] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('expense-added', () => {
      loadData();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [eventId]);

  const loadData = async () => {
    const [expensesResult, settlementsResult, attendeesResult] = await Promise.all([
      getEventExpenses(eventId),
      getSettlementSummary(eventId),
      getEventAttendees(eventId),
    ]);

    if (expensesResult.success) {
      setExpenses(expensesResult.expenses);
    }
    if (settlementsResult.success) {
      setSettlements(settlementsResult.settlements);
    }
    if (attendeesResult.success) {
      setAttendees(attendeesResult.attendees.filter((a: any) => a.rsvpStatus === 'GOING'));
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Calculate splits
    const amountInCents = Math.round(parseFloat(amount) * 100);
    const splitPeople = selectedPeople.length > 0 ? selectedPeople : attendees.map(a => a.userId);
    
    if (splitPeople.length === 0) {
      toast({
        title: 'Error',
        description: 'No one to split the expense with',
        variant: 'destructive',
      });
      return;
    }

    const amountPerPerson = Math.round(amountInCents / splitPeople.length);
    
    const splits = splitPeople.map(userId => ({
      userId,
      userName: attendees.find(a => a.userId === userId)?.userName || 'Unknown',
      amountOwed: amountPerPerson,
    }));

    const result = await addExpense(
      {
        eventId,
        payerId: currentUser.uid,
        payerName: currentUser.name,
        amount: amountInCents,
        description,
        category,
      },
      splits
    );

    if (result.success) {
      toast({
        title: 'Expense Added',
        description: `${description} - R ${amount}`,
      });
      setIsAddingExpense(false);
      setAmount('');
      setDescription('');
      setCategory('FOOD');
      setSelectedPeople([]);
      loadData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    }
  };

  const handleSettle = async (splitId: number) => {
    const result = await settleExpense(splitId);
    if (result.success) {
      toast({
        title: 'Settled',
        description: 'Expense marked as paid',
      });
      loadData();
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>💰 The Kitty</CardTitle>
          <CardDescription>Track and split expenses for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-3xl font-bold">R {(totalSpent / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total spent</p>
            </div>
            
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>Who paid and how much?</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Amount (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="500.00"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Pizza"
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOOD">Food</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                        <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                        <SelectItem value="ACTIVITY">Activity</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Split Type</Label>
                    <RadioGroup value={splitType} onValueChange={(v: any) => setSplitType(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EQUAL" id="equal" />
                        <Label htmlFor="equal">Equal Split (Everyone)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CUSTOM" id="custom" />
                        <Label htmlFor="custom">Custom (Select People)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {splitType === 'CUSTOM' && (
                    <div>
                      <Label>Split Between</Label>
                      <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                        {attendees.map(attendee => (
                          <label key={attendee.userId} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPeople.includes(attendee.userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPeople([...selectedPeople, attendee.userId]);
                                } else {
                                  setSelectedPeople(selectedPeople.filter(id => id !== attendee.userId));
                                }
                              }}
                            />
                            <span>{attendee.userName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddExpense} className="w-full">
                    Add Expense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Settlement Summary */}
          {Object.keys(settlements).length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Who Owes Whom:</h3>
              <div className="space-y-2">
                {Object.entries(settlements).map(([userId, data]: [string, any]) => {
                  const balance = data.owed - data.owes;
                  if (Math.abs(balance) < 1) return null; // Skip if balanced
                  
                  return (
                    <div key={userId} className="flex justify-between items-center">
                      <span className="font-medium">{data.name}</span>
                      <span className={balance > 0 ? 'text-green-600' : 'text-red-600'}>
                        {balance > 0 ? `is owed R ${(balance / 100).toFixed(2)}` : `owes R ${(-balance / 100).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map(expense => (
                <div key={expense.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Paid by {expense.payerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">R {(expense.amount / 100).toFixed(2)}</p>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm font-medium mb-2">Split between:</p>
                    <div className="space-y-1">
                      {expense.splits.map((split: any) => (
                        <div key={split.id} className="flex justify-between items-center text-sm">
                          <span>{split.userName}</span>
                          <div className="flex items-center gap-2">
                            <span className={split.isPaid ? 'line-through text-muted-foreground' : ''}>
                              R {(split.amountOwed / 100).toFixed(2)}
                            </span>
                            {!split.isPaid && split.userId === currentUser.uid && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSettle(split.id)}
                                className="gap-1 h-7"
                              >
                                <Check className="h-3 w-3" />
                                Settle
                              </Button>
                            )}
                            {split.isPaid && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No expenses yet. Add one to start tracking!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
