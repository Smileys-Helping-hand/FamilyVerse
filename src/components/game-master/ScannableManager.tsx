'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  createScannable, 
  getAllScannables, 
  updateScannableContent, 
  toggleScannableActive,
  deleteScannable 
} from '@/app/actions/scannables';
import type { Scannable } from '@/lib/db/schema';
import { QrCode, Trash2, Edit2, Check, X, Download } from 'lucide-react';

interface ScannableManagerProps {
  eventId: number;
}

export default function ScannableManager({ eventId }: ScannableManagerProps) {
  const [scannables, setScannables] = useState<Scannable[]>([]);
  const [selectedType, setSelectedType] = useState<'TASK' | 'TREASURE_NODE' | 'KILLER_EVIDENCE'>('TASK');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Create form state
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [chainId, setChainId] = useState('');
  const [chainOrder, setChainOrder] = useState('');
  const [rewardPoints, setRewardPoints] = useState('10');

  useEffect(() => {
    loadScannables();
  }, [selectedType]);

  const loadScannables = async () => {
    setLoading(true);
    const result = await getAllScannables(eventId, selectedType);
    if (result.success) {
      setScannables(result.scannables);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!label) return;

    setLoading(true);
    const result = await createScannable({
      eventId,
      type: selectedType,
      label,
      content: content || undefined,
      solutionCode: solutionCode || undefined,
      chainId: chainId || undefined,
      chainOrder: chainOrder ? parseInt(chainOrder) : undefined,
      rewardPoints: parseInt(rewardPoints),
    });

    if (result.success) {
      // Reset form
      setLabel('');
      setContent('');
      setSolutionCode('');
      setChainId('');
      setChainOrder('');
      setRewardPoints('10');
      
      // Reload list
      await loadScannables();
      
      // Download QR code
      if (result.qrCodeData) {
        const link = document.createElement('a');
        link.href = result.qrCodeData;
        link.download = `${label.replace(/\s+/g, '-')}.png`;
        link.click();
      }
    }
    setLoading(false);
  };

  const handleEdit = async (id: string) => {
    if (editingId === id) {
      // Save
      setLoading(true);
      await updateScannableContent(id, editContent);
      setEditingId(null);
      setEditContent('');
      await loadScannables();
      setLoading(false);
    } else {
      // Start editing
      const scannable = scannables.find((s) => s.id === id);
      if (scannable) {
        setEditingId(id);
        setEditContent(scannable.content || '');
      }
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setLoading(true);
    await toggleScannableActive(id, !currentState);
    await loadScannables();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scannable?')) return;
    
    setLoading(true);
    await deleteScannable(id);
    await loadScannables();
    setLoading(false);
  };

  const downloadQR = (qrCodeData: string, label: string) => {
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `${label.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="TASK">Tasks</TabsTrigger>
          <TabsTrigger value="TREASURE_NODE">Treasure Hunt</TabsTrigger>
          <TabsTrigger value="KILLER_EVIDENCE">Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="TASK" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Task Scannable</CardTitle>
              <CardDescription>
                Physical tasks that players complete by scanning QR codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="task-label">Task Label</Label>
                <Input
                  id="task-label"
                  placeholder="e.g., 'Task #1: Kitchen Challenge'"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="task-content">Task Instructions</Label>
                <Textarea
                  id="task-content"
                  placeholder="Describe what players need to do..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="task-points">Reward Points</Label>
                <Input
                  id="task-points"
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} disabled={loading || !label}>
                <QrCode className="mr-2 h-4 w-4" />
                Create & Download QR
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="TREASURE_NODE" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Treasure Hunt Node</CardTitle>
              <CardDescription>
                Multi-step treasure hunt where players must scan in order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hunt-label">Node Label</Label>
                <Input
                  id="hunt-label"
                  placeholder="e.g., 'Clue #1: The Kitchen'"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hunt-content">Clue Content</Label>
                <Textarea
                  id="hunt-content"
                  placeholder="Hint for next location..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chain-id">Chain ID</Label>
                  <Input
                    id="chain-id"
                    placeholder="treasure-hunt-1"
                    value={chainId}
                    onChange={(e) => setChainId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Same ID for all nodes in a hunt
                  </p>
                </div>
                <div>
                  <Label htmlFor="chain-order">Step Number</Label>
                  <Input
                    id="chain-order"
                    type="number"
                    placeholder="1"
                    value={chainOrder}
                    onChange={(e) => setChainOrder(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Order in the sequence
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="solution-code">Solution Code (Optional)</Label>
                <Input
                  id="solution-code"
                  placeholder="Enter passcode for locked clues"
                  value={solutionCode}
                  onChange={(e) => setSolutionCode(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} disabled={loading || !label || !chainId || !chainOrder}>
                <QrCode className="mr-2 h-4 w-4" />
                Create Hunt Node
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="KILLER_EVIDENCE" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Evidence Scannable</CardTitle>
              <CardDescription>
                Physical evidence clues that can be edited live during the party
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="evidence-label">Evidence Label</Label>
                <Input
                  id="evidence-label"
                  placeholder="e.g., 'Evidence #1'"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: Create with empty content, print now, edit live during party
                </p>
              </div>
              <div>
                <Label htmlFor="evidence-content">Evidence Content (Can be empty)</Label>
                <Textarea
                  id="evidence-content"
                  placeholder="Leave empty to edit during the party..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleCreate} disabled={loading || !label}>
                <QrCode className="mr-2 h-4 w-4" />
                Create Evidence QR
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* List of existing scannables */}
      <Card>
        <CardHeader>
          <CardTitle>Existing {selectedType === 'TASK' ? 'Tasks' : selectedType === 'TREASURE_NODE' ? 'Hunt Nodes' : 'Evidence'}</CardTitle>
          <CardDescription>
            {selectedType === 'KILLER_EVIDENCE' && '✨ Live editing enabled - update content during the party!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : scannables.length === 0 ? (
            <p className="text-muted-foreground">No scannables created yet</p>
          ) : (
            <div className="space-y-4">
              {scannables.map((scannable) => (
                <div key={scannable.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{scannable.label}</h4>
                        <Badge variant={scannable.isActive ? 'default' : 'secondary'}>
                          {scannable.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {scannable.chainId && (
                          <Badge variant="outline">
                            Step {scannable.chainOrder}
                          </Badge>
                        )}
                      </div>
                      {editingId === scannable.id ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {scannable.content || <em>No content yet - edit to add</em>}
                        </p>
                      )}
                      {scannable.solutionCode && (
                        <p className="text-xs text-muted-foreground mt-1">
                          🔒 Protected with code: {scannable.solutionCode}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {scannable.qrCodeData && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQR(scannable.qrCodeData!, scannable.label)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(scannable.id)}
                        disabled={loading}
                      >
                        {editingId === scannable.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Edit2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(scannable.id, scannable.isActive)}
                        disabled={loading}
                      >
                        {scannable.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(scannable.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
