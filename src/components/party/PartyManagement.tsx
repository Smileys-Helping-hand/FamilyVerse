'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper, Plus, Copy, Check, Users } from 'lucide-react';
import { createPartyAction, getAllPartiesAction } from '@/app/actions/party-logic';

export function PartyManagement() {
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchParties = async () => {
    const result = await getAllPartiesAction();
    if (result.success && result.parties) {
      setParties(result.parties);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleCreateParty = async () => {
    if (!newPartyName.trim()) {
      toast({
        title: '❌ Error',
        description: 'Party name is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await createPartyAction(newPartyName.trim());

    if (result.success && result.party) {
      toast({
        title: '🎉 Party Created!',
        description: `Join code: ${result.party.joinCode}`,
      });
      setNewPartyName('');
      await fetchParties();
    } else {
      toast({
        title: '❌ Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: '✅ Copied!',
      description: `Join code ${code} copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Create New Party */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Party
          </CardTitle>
          <CardDescription>
            Generate a new party with a unique join code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="party-name">Party Name</Label>
            <Input
              id="party-name"
              placeholder="e.g., Mohammed's Birthday Bash"
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateParty();
                }
              }}
            />
          </div>
          <Button
            onClick={handleCreateParty}
            disabled={loading || !newPartyName.trim()}
            className="w-full"
            size="lg"
          >
            <PartyPopper className="h-5 w-5 mr-2" />
            {loading ? 'Creating...' : 'Create Party'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Parties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Parties ({parties.length})
          </CardTitle>
          <CardDescription>
            All parties you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PartyPopper className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No parties yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{party.name}</h3>
                      {party.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(party.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                      <p className="text-2xl font-bold font-mono tracking-wider text-purple-600">
                        {party.joinCode}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(party.joinCode)}
                    >
                      {copiedCode === party.joinCode ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Instructions */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-purple-600" />
              How to Share
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Share the join code with your guests</li>
              <li>They visit your party site and enter the code</li>
              <li>They create a profile and join the fun!</li>
              <li>You manage everything from this dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
