'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChecklistManager } from '@/components/groups/ChecklistManager';
import { RecommendationsManager } from '@/components/groups/RecommendationsManager';
import { ArrowLeft, Calendar, MapPin, Users, Copy, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Mock data - replace with Postgres data
const mockGroup = {
  id: 1,
  name: 'Weekend Mountain Trip',
  description: 'A relaxing weekend getaway to the mountains with friends',
  type: 'trip' as const,
  joinCode: 'MTN2024',
  creatorId: 'user1',
  memberIds: ['user1', 'user2', 'user3'],
  createdAt: new Date('2024-01-15'),
  startDate: new Date('2024-03-10'),
  endDate: new Date('2024-03-12'),
  location: 'Lake District, UK',
};

const mockMembers = [
  { userId: 'user1', userName: 'Alice Johnson', email: 'alice@example.com', role: 'admin' as const, joinedAt: new Date('2024-01-15') },
  { userId: 'user2', userName: 'Bob Smith', email: 'bob@example.com', role: 'member' as const, joinedAt: new Date('2024-01-16') },
  { userId: 'user3', userName: 'Carol White', email: 'carol@example.com', role: 'member' as const, joinedAt: new Date('2024-01-17') },
];

const mockChecklistItems = [
  {
    id: 1,
    groupId: 1,
    title: 'Pack hiking boots',
    description: 'Don\'t forget the waterproof ones',
    category: 'packing' as const,
    completed: true,
    priority: 'high' as const,
    createdBy: 'user1',
    createdAt: new Date(),
    completedAt: new Date(),
    completedBy: 'user1',
  },
  {
    id: 2,
    groupId: 1,
    title: 'Buy trail snacks',
    category: 'shopping' as const,
    completed: false,
    priority: 'medium' as const,
    createdBy: 'user2',
    createdAt: new Date(),
  },
  {
    id: 3,
    groupId: 1,
    title: 'Book accommodation',
    category: 'todo' as const,
    completed: false,
    priority: 'high' as const,
    dueDate: new Date('2024-02-20'),
    createdBy: 'user1',
    createdAt: new Date(),
  },
];

const mockRecommendations = [
  {
    id: 1,
    groupId: 1,
    type: 'restaurant' as const,
    title: 'The Mountain View Cafe',
    description: 'Amazing breakfast with stunning views of the valley',
    location: 'Main Street, Ambleside',
    price: '$$' as const,
    rating: 4.5,
    notes: 'Get there early to avoid the queue!',
    suggestedBy: 'user1',
    votes: [
      { userId: 'user1', vote: 'up' as const },
      { userId: 'user2', vote: 'up' as const },
    ],
    createdAt: new Date(),
  },
  {
    id: 2,
    groupId: 1,
    type: 'activity' as const,
    title: 'Scafell Pike Summit',
    description: 'England\'s highest peak - challenging but rewarding hike',
    location: 'Wasdale Head',
    url: 'https://www.nationaltrust.org.uk/visit/lake-district/scafell-pike',
    notes: 'Allow 6-8 hours for the round trip',
    suggestedBy: 'user2',
    votes: [
      { userId: 'user1', vote: 'up' as const },
      { userId: 'user3', vote: 'up' as const },
    ],
    createdAt: new Date(),
  },
];

export default function GroupDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(mockGroup.joinCode);
    toast({
      title: "Copied!",
      description: "Join code copied to clipboard.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-blue-500/10 text-blue-500';
      case 'event': return 'bg-purple-500/10 text-purple-500';
      case 'project': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/groups">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{mockGroup.name}</h1>
              <Badge className={getTypeColor(mockGroup.type)}>
                {mockGroup.type}
              </Badge>
            </div>
            <p className="text-muted-foreground">{mockGroup.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
              {mockGroup.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mockGroup.location}
                </span>
              )}
              {mockGroup.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(mockGroup.startDate), 'MMM d, yyyy')}
                  {mockGroup.endDate && ` - ${format(new Date(mockGroup.endDate), 'MMM d, yyyy')}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {mockMembers.length} members
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">
                {mockGroup.joinCode}
              </code>
              <Button variant="outline" size="sm" onClick={copyJoinCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <ChecklistManager 
            groupId={mockGroup.id}
            items={mockChecklistItems}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsManager 
            groupId={mockGroup.id}
            recommendations={mockRecommendations}
            currentUserId="user1"
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>
                People who are part of this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMembers.map(member => (
                  <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{member.userName}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
