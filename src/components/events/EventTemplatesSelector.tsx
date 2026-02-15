'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, 
  Calendar,
  MapPin,
  Users,
  PartyPopper,
  Utensils,
  Mountain,
  Trophy,
  Baby,
  GraduationCap,
  Heart,
  Plane
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getEventTemplates, createEventFromTemplate } from '@/app/actions/event-planning';

interface EventTemplatesSelectorProps {
  familyId?: string;
  currentUser: {
    uid: string;
    name: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  defaultDuration?: number;
  usageCount: number;
  isSystem: boolean;
}

const TEMPLATE_ICONS: Record<string, any> = {
  'birthday': PartyPopper,
  'braai': Utensils,
  'hike': Mountain,
  'sports': Trophy,
  'baby-shower': Baby,
  'graduation': GraduationCap,
  'anniversary': Heart,
  'vacation': Plane,
  'default': Calendar,
};

export default function EventTemplatesSelector({ 
  familyId, 
  currentUser, 
  isOpen, 
  onClose 
}: EventTemplatesSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: '',
    startTime: '',
    endTime: '',
    locationName: '',
    lat: '',
    lng: '',
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, familyId]);

  const loadTemplates = async () => {
    setLoading(true);
    const result = await getEventTemplates(familyId);
    if (result.success) {
      setTemplates(result.templates as any);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setEventDetails({
      title: template.name,
      startTime: '',
      endTime: '',
      locationName: '',
      lat: '',
      lng: '',
    });
    setShowDetailsForm(true);
  };

  const handleCreateEvent = async () => {
    if (!selectedTemplate || !eventDetails.title || !eventDetails.startTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in event title and start time',
        variant: 'destructive',
      });
      return;
    }

    const coordinates = eventDetails.lat && eventDetails.lng
      ? { lat: parseFloat(eventDetails.lat), lng: parseFloat(eventDetails.lng) }
      : undefined;

    const result = await createEventFromTemplate(selectedTemplate.id, {
      title: eventDetails.title,
      startTime: new Date(eventDetails.startTime),
      endTime: eventDetails.endTime ? new Date(eventDetails.endTime) : undefined,
      locationName: eventDetails.locationName || undefined,
      coordinates,
      creatorId: currentUser.uid,
      familyId,
    });

    if (result.success) {
      toast({
        title: 'Event Created!',
        description: `"${eventDetails.title}" has been created with checklist and supplies`,
      });
      onClose();
      router.push(`/events/${result.event?.id}`);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const getTemplateIcon = (templateName: string) => {
    const key = Object.keys(TEMPLATE_ICONS).find(k => 
      templateName.toLowerCase().includes(k)
    );
    return TEMPLATE_ICONS[key || 'default'];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Event Creation
          </DialogTitle>
          <DialogDescription>
            Choose a template to quickly create an event with pre-configured checklists and supplies
          </DialogDescription>
        </DialogHeader>

        {!showDetailsForm ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading templates...</div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const Icon = getTemplateIcon(template.name);
                  return (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="rounded-full bg-primary/10 p-3">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          {template.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <CardDescription className="line-clamp-2">
                            {template.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Used {template.usageCount} times</span>
                          {template.defaultDuration && (
                            <span>{template.defaultDuration}h</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {selectedTemplate && (
                <>
                  {(() => {
                    const Icon = getTemplateIcon(selectedTemplate.name);
                    return <Icon className="h-8 w-8 text-primary" />;
                  })()}
                  <div>
                    <h3 className="font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={eventDetails.title}
                  onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                  placeholder="e.g., Sarah's 5th Birthday"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={eventDetails.startTime}
                    onChange={(e) => setEventDetails({ ...eventDetails, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={eventDetails.endTime}
                    onChange={(e) => setEventDetails({ ...eventDetails, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="locationName">Location</Label>
                <Input
                  id="locationName"
                  value={eventDetails.locationName}
                  onChange={(e) => setEventDetails({ ...eventDetails, locationName: e.target.value })}
                  placeholder="e.g., Smith Family Home"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude (Optional)</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={eventDetails.lat}
                    onChange={(e) => setEventDetails({ ...eventDetails, lat: e.target.value })}
                    placeholder="-33.9249"
                  />
                </div>

                <div>
                  <Label htmlFor="lng">Longitude (Optional)</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={eventDetails.lng}
                    onChange={(e) => setEventDetails({ ...eventDetails, lng: e.target.value })}
                    placeholder="18.4241"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleCreateEvent} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button 
                onClick={() => {
                  setShowDetailsForm(false);
                  setSelectedTemplate(null);
                }} 
                variant="outline"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
