'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, DollarSign, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { createExpenseFromReceipt } from '@/app/actions/expenses';

interface ExpenseScannerProps {
  eventId: number;
  payerId: string;
  availableFriends: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ExpenseScanner({
  eventId,
  payerId,
  availableFriends,
  onSuccess,
}: ExpenseScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a receipt image');
      return;
    }

    if (availableFriends.length === 0) {
      setError('Add party friends before splitting expenses');
      return;
    }

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend to split with');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('eventId', eventId.toString());
      formData.append('payerId', payerId);
      formData.append('splitWith', JSON.stringify(selectedFriends));

      const response = await createExpenseFromReceipt(formData);

      if (response.success) {
        setResult(response.data);
        onSuccess?.();
      } else {
        setError(response.error || 'Failed to process receipt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Receipt
          </CardTitle>
          <CardDescription>
            Upload a receipt and AI will extract the details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Image</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="receipt" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="max-h-64 mx-auto rounded"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">Click to upload receipt</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Friend Selection */}
          {file && availableFriends.length === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No party friends yet. Invite guests to join before splitting expenses.
            </div>
          )}

          {file && availableFriends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Label>Split with:</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => toggleFriend(friend.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => toggleFriend(friend.id)}
                      />
                      <Label className="cursor-pointer">{friend.name}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-destructive/10 border border-destructive rounded-lg"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          {file && selectedFriends.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={processing}
              size="lg"
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Receipt...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Scan & Split
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-green-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Receipt Processed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Extracted Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Merchant</p>
                  </div>
                  <p className="font-bold text-lg">
                    {result.extractedData.merchant}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <p className="font-bold text-lg">
                    ${result.extractedData.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="font-semibold mb-2">Items:</p>
                <div className="space-y-2">
                  {result.extractedData.items.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span className="text-sm">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Split Info */}
              <div className="pt-4 border-t">
                <p className="font-semibold mb-3">Split Breakdown:</p>
                {result.splits.map((split: any, index: number) => {
                  const friend = availableFriends.find(
                    (f) => f.id === split.userId
                  );
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {split.userId === payerId
                          ? 'You (Paid)'
                          : friend?.name || split.userId}
                      </span>
                      <Badge variant={split.isPaid ? 'default' : 'secondary'}>
                        {split.isPaid
                          ? 'Paid'
                          : `Owes $${(split.amountOwed / 100).toFixed(2)}`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
