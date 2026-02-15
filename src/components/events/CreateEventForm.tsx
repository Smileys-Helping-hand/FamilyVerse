'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createEvent } from '@/app/actions/events';
import Link from 'next/link';

interface CreateEventFormProps {
  user: {
    uid: string;
    email: string;
    name: string;
    familyId?: string;
  };
}

export default function CreateEventForm({ user }: CreateEventFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    locationName: '',
    lat: '',
    lng: '',
    heroImageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const coordinates =
      formData.lat && formData.lng
        ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
        : undefined;

    const result = await createEvent({
      title: formData.title,
      description: formData.description || undefined,
      startTime: new Date(formData.startTime),
      endTime: formData.endTime ? new Date(formData.endTime) : undefined,
      locationName: formData.locationName || undefined,
      coordinates,
      heroImageUrl: formData.heroImageUrl || generateUnsplashUrl(formData.title),
      creatorId: user.uid,
      familyId: user.familyId,
      status: 'UPCOMING',
    });

    if (result.success) {
      toast({
        title: 'Event Created!',
        description: `"${formData.title}" has been created`,
      });
      router.push(`/events/${result.event?.id}`);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const generateUnsplashUrl = (title: string) => {
    // Generate a random Unsplash image based on the title
    const keywords = title.toLowerCase().includes('hike')
      ? 'hiking,mountain'
      : title.toLowerCase().includes('beach')
      ? 'beach,ocean'
      : title.toLowerCase().includes('party')
      ? 'party,celebration'
      : 'family,gathering';
    return `https://source.unsplash.com/1600x900/?${keywords}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Event</CardTitle>
            <CardDescription>Plan your next family outing or gathering</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Sunday Hike"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell everyone what this event is about..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time (Optional)</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </h3>

                <div>
                  <Label htmlFor="locationName">Location Name</Label>
                  <Input
                    id="locationName"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g., Lion's Head Trail"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="-33.9249"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="18.4241"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Tip: Right-click on Google Maps and select "What's here?" to get coordinates
                </p>
              </div>

              {/* Hero Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Hero Image
                </h3>

                <div>
                  <Label htmlFor="heroImage">Image URL (Optional)</Label>
                  <Input
                    id="heroImage"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="Leave blank for auto-generated image"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll automatically generate a beautiful hero image from Unsplash if you leave this blank
                  </p>
                </div>

                {/* Preview */}
                {(formData.heroImageUrl || formData.title) && (
                  <div className="relative h-48 rounded-lg overflow-hidden border">
                    <img
                      src={formData.heroImageUrl || generateUnsplashUrl(formData.title)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://source.unsplash.com/1600x900/?family,gathering';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1">
                  Create Event
                </Button>
                <Link href="/events">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
