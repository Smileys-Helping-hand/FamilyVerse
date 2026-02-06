'use client';

import { useState } from 'react';
import { CreateGroupForm } from '@/components/groups/CreateGroupForm';
import { JoinGroupForm } from '@/components/groups/JoinGroupForm';
import { GroupCard } from '@/components/groups/GroupCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, UserPlus } from 'lucide-react';

// Mock data - replace with Firebase data
const mockGroups = [
  {
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
  },
  {
    id: 2,
    name: 'Summer BBQ Party',
    description: 'Annual summer barbecue at the park',
    type: 'event' as const,
    joinCode: 'BBQ2024',
    creatorId: 'user1',
    memberIds: ['user1', 'user2', 'user3', 'user4', 'user5'],
    createdAt: new Date('2024-02-01'),
    startDate: new Date('2024-07-15'),
    location: 'Central Park',
  },
];

export default function GroupsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
        <p className="text-muted-foreground mt-2">
          Create groups with friends for trips, events, and projects. Stay organized with checklists and recommendations.
        </p>
      </div>

      <Tabs defaultValue="my-groups" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="my-groups">
            <Users className="h-4 w-4 mr-2" />
            My Groups
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </TabsTrigger>
          <TabsTrigger value="join">
            <UserPlus className="h-4 w-4 mr-2" />
            Join
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {mockGroups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Groups Yet</CardTitle>
                <CardDescription>
                  Create a new group or join an existing one to get started.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockGroups.map(group => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  memberCount={group.memberIds.length}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl">
            <CreateGroupForm onSuccess={handleRefresh} />
          </div>
        </TabsContent>

        <TabsContent value="join">
          <div className="max-w-2xl">
            <JoinGroupForm onSuccess={handleRefresh} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
