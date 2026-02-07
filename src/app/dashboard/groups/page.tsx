'use client';

import { useEffect, useState } from 'react';
import { CreateGroupForm } from '@/components/groups/CreateGroupForm';
import { JoinGroupForm } from '@/components/groups/JoinGroupForm';
import { GroupCard } from '@/components/groups/GroupCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserGroupsAction } from '@/app/actions/groups';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  const loadGroups = async () => {
    if (!userProfile?.uid) {
      setGroups([]);
      return;
    }

    setLoading(true);
    const result = await getUserGroupsAction(userProfile.uid);
    if (result.success) {
      setGroups(result.groups || []);
    } else {
      setGroups([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, [userProfile?.uid]);

  const handleRefresh = () => {
    loadGroups();
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
          {loading ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading Groups...</CardTitle>
                <CardDescription>Fetching your latest groups.</CardDescription>
              </CardHeader>
            </Card>
          ) : groups.length === 0 ? (
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
              {groups.map(group => (
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
