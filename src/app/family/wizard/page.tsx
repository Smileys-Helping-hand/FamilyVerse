'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  connectParent,
  createShadowUser,
  searchPeople,
} from '@/app/actions/family-tree';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Users, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function RelationshipWizardPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<'choose' | 'father' | 'mother' | 'partner'>('choose');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [relationshipType, setRelationshipType] = useState<'BIOLOGICAL' | 'ADOPTED' | 'STEP'>(
    'BIOLOGICAL'
  );
  const [creating, setCreating] = useState(false);

  // Ghost Profile creation
  const [showGhostDialog, setShowGhostDialog] = useState(false);
  const [ghostForm, setGhostForm] = useState({
    firstName: '',
    lastName: '',
    birthYear: '',
    deathYear: '',
    gender: '',
  });

  async function handleSearch() {
    const result = await searchPeople(searchQuery);
    if (result.success) {
      setSearchResults(result.people);
    }
  }

  async function handleConnect() {
    if (!user || !userProfile || !selectedPerson) return;

    setCreating(true);

    const result = await connectParent({
      childId: user.uid,
      parentId: selectedPerson.id,
      relationshipType,
      createdById: user.uid,
    });

    if (result.success) {
      toast({
        title: 'Connected!',
        description: `${selectedPerson.displayName} is now connected to your family tree`,
      });
      router.push('/family/tree');
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }

    setCreating(false);
  }

  async function handleCreateGhost() {
    if (!user || !ghostForm.firstName) return;

    const displayName = `${ghostForm.firstName} ${ghostForm.lastName || ''}`.trim();

    const result = await createShadowUser({
      firstName: ghostForm.firstName,
      lastName: ghostForm.lastName,
      displayName,
      birthYear: ghostForm.birthYear ? parseInt(ghostForm.birthYear) : undefined,
      deathYear: ghostForm.deathYear ? parseInt(ghostForm.deathYear) : undefined,
      gender: ghostForm.gender || undefined,
      createdById: user.uid,
    });

    if (result.success) {
      toast({
        title: 'Ancestor Created!',
        description: `${displayName} was added to the family tree`,
      });
      setShowGhostDialog(false);
      setGhostForm({ firstName: '', lastName: '', birthYear: '', deathYear: '', gender: '' });
      
      // Now select this person for connection
      setSelectedPerson({
        ...result.shadowUser,
        type: 'shadow',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to use the Relationship Wizard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/family/tree">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tree
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Relationship Wizard
        </h1>
        <p className="text-gray-600 mt-2">
          Build your family tree step by step. Start by connecting your parents!
        </p>
      </div>

      {/* Step 1: Choose Relationship Type */}
      {step === 'choose' && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStep('father')}
          >
            <CardHeader>
              <CardTitle className="text-lg">👨 Add Father</CardTitle>
              <CardDescription>Connect your father to the family tree</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStep('mother')}
          >
            <CardHeader>
              <CardTitle className="text-lg">👩 Add Mother</CardTitle>
              <CardDescription>Connect your mother to the family tree</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setStep('partner')}
          >
            <CardHeader>
              <CardTitle className="text-lg">💑 Add Partner</CardTitle>
              <CardDescription>Connect your spouse or partner</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Step 2: Search and Connect */}
      {(step === 'father' || step === 'mother' || step === 'partner') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {step === 'father' && '👨 Who is your father?'}
                  {step === 'mother' && '👩 Who is your mother?'}
                  {step === 'partner' && '💑 Who is your partner?'}
                </CardTitle>
                <CardDescription>
                  Search for an app user, or create an "Ancestor Profile" if they don't have an
                  account
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setStep('choose')}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name..."
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Ghost Profile Button */}
            <Dialog open={showGhostDialog} onOpenChange={setShowGhostDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Ancestor Profile (No App Account Needed)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Ancestor Profile</DialogTitle>
                  <DialogDescription>
                    Add an ancestor who doesn't have an app account. They'll appear as a "Ghost
                    Profile" in the tree.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={ghostForm.firstName}
                      onChange={(e) =>
                        setGhostForm({ ...ghostForm, firstName: e.target.value })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={ghostForm.lastName}
                      onChange={(e) =>
                        setGhostForm({ ...ghostForm, lastName: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Birth Year</Label>
                      <Input
                        type="number"
                        value={ghostForm.birthYear}
                        onChange={(e) =>
                          setGhostForm({ ...ghostForm, birthYear: e.target.value })
                        }
                        placeholder="1950"
                      />
                    </div>
                    <div>
                      <Label>Death Year (optional)</Label>
                      <Input
                        type="number"
                        value={ghostForm.deathYear}
                        onChange={(e) =>
                          setGhostForm({ ...ghostForm, deathYear: e.target.value })
                        }
                        placeholder="2020"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={ghostForm.gender}
                      onValueChange={(value) =>
                        setGhostForm({ ...ghostForm, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateGhost} className="w-full">
                    Create Ancestor Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                {searchResults.map((person) => (
                  <Card
                    key={person.id}
                    className={`cursor-pointer transition-all ${
                      selectedPerson?.id === person.id
                        ? 'ring-2 ring-purple-600'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={person.avatarUrl} />
                          <AvatarFallback>{person.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{person.displayName}</p>
                          <p className="text-sm text-gray-500">{person.email}</p>
                          {person.type === 'shadow' && (
                            <span className="text-xs text-purple-600">👻 Ancestor</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Relationship Type */}
            {selectedPerson && (step === 'father' || step === 'mother') && (
              <div>
                <Label>Relationship Type</Label>
                <Select
                  value={relationshipType}
                  onValueChange={(value: any) => setRelationshipType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIOLOGICAL">Biological</SelectItem>
                    <SelectItem value="ADOPTED">Adopted</SelectItem>
                    <SelectItem value="STEP">Step-parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Connect Button */}
            {selectedPerson && (
              <Button onClick={handleConnect} disabled={creating} className="w-full">
                <Users className="w-4 h-4 mr-2" />
                {creating ? 'Connecting...' : `Connect ${selectedPerson.displayName}`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Start by adding your parents, then ask them to add theirs!</li>
            <li>
              • Use "Ancestor Profiles" for people who passed away or don't use the app
            </li>
            <li>• The tree updates live for everyone - great for family gatherings!</li>
            <li>• Zoom out on the tree to see the full family map</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
