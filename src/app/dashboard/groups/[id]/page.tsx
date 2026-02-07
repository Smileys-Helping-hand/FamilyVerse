'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChecklistManager } from '@/components/groups/ChecklistManager';
import { RecommendationsManager } from '@/components/groups/RecommendationsManager';
import { ArrowLeft, Calendar, MapPin, Users, Copy, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { getGroupDetailsAction } from '@/app/actions/groups';
import type { ChecklistItem, Group, GroupMember, Recommendation } from '@/types';

export default function GroupDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const groupId = useMemo(() => (params?.id ? String(params.id) : ''), [params?.id]);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    const result = await getGroupDetailsAction(groupId);
    if (result.success) {
      setGroup(result.group as Group);
      setMembers((result.members || []) as GroupMember[]);
      setChecklistItems((result.checklistItems || []) as ChecklistItem[]);
      setRecommendations((result.recommendations || []) as Recommendation[]);
    } else {
      setError(result.error || 'Failed to load group');
      setGroup(null);
      setMembers([]);
      setChecklistItems([]);
      setRecommendations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const copyJoinCode = () => {
    if (!group?.joinCode) return;
    navigator.clipboard.writeText(group.joinCode);
    toast({
      title: 'Copied!',
      description: 'Join code copied to clipboard.',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip':
        return 'bg-blue-500/10 text-blue-500';
      case 'event':
        return 'bg-purple-500/10 text-purple-500';
      case 'project':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
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
        
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Loading Group...</CardTitle>
              <CardDescription>Fetching details for this group.</CardDescription>
            </CardHeader>
          </Card>
        ) : !group || error ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Group Not Loaded
              </CardTitle>
              <CardDescription>
                {error || `Group data is not available yet. Connect a data source to view group ${groupId ? `#${groupId}` : ''}.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/groups">
                <Button variant="outline">Back to Groups</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                  <Badge className={getTypeColor(group.type)}>
                    {group.type}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{group.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                  {group.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {group.location}
                    </span>
                  )}
                  {group.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(group.startDate), 'MMM d, yyyy')}
                      {group.endDate && ` - ${format(new Date(group.endDate), 'MMM d, yyyy')}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {members.length} members
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">
                    {group.joinCode}
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

            <Tabs defaultValue="checklist" className="space-y-6">
              <TabsList>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist">
                <ChecklistManager
                  groupId={group.id}
                  items={checklistItems}
                  currentUserId={userProfile?.uid || ''}
                  onUpdate={loadGroup}
                />
              </TabsContent>

              <TabsContent value="recommendations">
                <RecommendationsManager
                  groupId={group.id}
                  recommendations={recommendations}
                  currentUserId={userProfile?.uid || ''}
                  onUpdate={loadGroup}
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
                      {members.map(member => (
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
          </>
        )}
      </div>
    </div>
  );
}
