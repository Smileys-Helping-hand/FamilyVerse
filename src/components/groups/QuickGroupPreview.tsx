'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Mock data - replace with actual Firebase data
const mockUpcomingGroup = {
  id: 1,
  name: 'Weekend Mountain Trip',
  type: 'trip' as const,
  startDate: new Date('2024-03-10'),
  location: 'Lake District, UK',
  memberCount: 3,
};

export function QuickGroupPreview() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Upcoming Group
          </CardTitle>
          <Badge variant="secondary">Trip</Badge>
        </div>
        <CardDescription>Your next planned activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockUpcomingGroup ? (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold">{mockUpcomingGroup.name}</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {mockUpcomingGroup.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(mockUpcomingGroup.startDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {mockUpcomingGroup.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{mockUpcomingGroup.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{mockUpcomingGroup.memberCount} members</span>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/groups/${mockUpcomingGroup.id}`}>
              <Button className="w-full" size="sm">
                View Details
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">No upcoming groups</p>
            <Link href="/dashboard/groups">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Create a Group
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
