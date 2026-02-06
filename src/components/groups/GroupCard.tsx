'use client';

import { Group } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
  memberCount: number;
}

export function GroupCard({ group, memberCount }: GroupCardProps) {
  const { toast } = useToast();

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group.joinCode);
    toast({
      title: "Copied!",
      description: "Join code copied to clipboard.",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'event': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'project': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{group.name}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </div>
          <Badge className={getTypeColor(group.type)}>
            {group.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          {group.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{group.location}</span>
            </div>
          )}
          
          {group.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(group.startDate), 'MMM d, yyyy')}
                {group.endDate && ` - ${format(new Date(group.endDate), 'MMM d, yyyy')}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex-1 flex items-center gap-2">
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              {group.joinCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyJoinCode}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <Link href={`/dashboard/groups/${group.id}`}>
            <Button size="sm">
              Open
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
