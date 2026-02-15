'use client';

import { useState, useEffect } from 'react';
import {
  getChildren,
  addChild,
  assignGuardian,
  checkInChild,
  getEventGuardianships,
  getChildCheckIns,
  triggerSOS,
  resolveSOS,
  getActiveSOSAlerts,
} from '@/app/actions/events-extended';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Baby,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Plus,
  Bell,
  Cloud,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher/client';
import { useToast } from '@/hooks/use-toast';

const pusherClient = getPusherClient();
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Child = {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  age: number;
  allergies: string | null;
  emergencyNotes: string | null;
  photoUrl: string | null;
  createdAt: Date;
};

type CheckInStatus = 'SAFE_WITH_PARENT' | 'PLAYING' | 'WITH_GUARDIAN' | 'EATING' | 'MISSING';

type SosAlert = {
  id: string;
  eventId: string;
  alertType: 'LOST_CHILD' | 'MEDICAL' | 'SECURITY' | 'WEATHER';
  childId: string | null;
  triggeredBy: string;
  triggeredByName: string;
  message: string;
  lastSeenLocation: string | null;
  isResolved: boolean;
  resolvedBy: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

const STATUS_COLORS: Record<CheckInStatus, string> = {
  SAFE_WITH_PARENT: 'bg-green-100 text-green-800',
  PLAYING: 'bg-blue-100 text-blue-800',
  WITH_GUARDIAN: 'bg-purple-100 text-purple-800',
  EATING: 'bg-orange-100 text-orange-800',
  MISSING: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<CheckInStatus, string> = {
  SAFE_WITH_PARENT: '✅ With Parent',
  PLAYING: '🎮 Playing',
  WITH_GUARDIAN: '👤 With Guardian',
  EATING: '🍽️ Eating',
  MISSING: '🚨 MISSING',
};

export default function GuardianTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);

  // Form state
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    allergies: '',
    emergencyNotes: '',
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = pusherClient.subscribe(`event-${eventId}`);

    channel.bind('child-checked-in', (data: any) => {
      toast({
        title: '✅ Child Checked In',
        description: `${data.childName} status updated`,
      });
      loadData();
    });

    channel.bind('guardian-assigned', (data: any) => {
      toast({
        title: '👤 Guardian Assigned',
        description: `New guardian assignment created`,
      });
      loadData();
    });

    channel.bind('sos-alert', (data: any) => {
      const alertMessage = data.child
        ? `🚨 SOS ALERT: ${data.alert.message} - ${data.child.name}`
        : `🚨 SOS ALERT: ${data.alert.message}`;

      toast({
        title: 'EMERGENCY ALERT',
        description: alertMessage,
        variant: 'destructive',
      });

      // Play alert sound (if browser allows)
      try {
        const audio = new Audio('/alert-sound.mp3');
        audio.play().catch(() => console.log('Could not play alert sound'));
      } catch (e) {
        console.log('Audio not supported');
      }

      loadData();
    });

    channel.bind('sos-resolved', (data: any) => {
      toast({
        title: '✅ SOS Resolved',
        description: 'Emergency has been resolved',
      });
      loadData();
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  async function loadData() {
    if (!user) return;

    const [childrenRes, checkInsRes, alertsRes] = await Promise.all([
      getChildren(user.uid),
      getChildCheckIns(eventId),
      getActiveSOSAlerts(eventId),
    ]);

    if (childrenRes.success) {
      setChildren(childrenRes.children);
    }
    if (checkInsRes.success) {
      setCheckIns(checkInsRes.checkIns);
    }
    if (alertsRes.success) {
      setSosAlerts(alertsRes.alerts);
    }

    setLoading(false);
  }

  async function handleAddChild() {
    if (!user || !newChild.name.trim()) return;

    await addChild({
      name: newChild.name,
      parentId: user.uid,
      parentName: user.displayName || 'Anonymous',
      age: parseInt(newChild.age) || 0,
      allergies: newChild.allergies || null,
      emergencyNotes: newChild.emergencyNotes || null,
      photoUrl: null,
    });

    setNewChild({ name: '', age: '', allergies: '', emergencyNotes: '' });
    setIsAddingChild(false);
    loadData();
  }

  async function handleCheckIn(childId: string, status: CheckInStatus, location?: string) {
    if (!user) return;

    await checkInChild({
      eventId,
      childId,
      guardianId: user.uid,
      guardianName: user.displayName || 'Anonymous',
      status,
      location: location || null,
    });
  }

  async function handleTriggerSOS(
    alertType: 'LOST_CHILD' | 'MEDICAL' | 'SECURITY' | 'WEATHER',
    childId?: string,
    message?: string
  ) {
    if (!user) return;

    await triggerSOS({
      eventId,
      alertType,
      childId: childId || null,
      triggeredBy: user.uid,
      triggeredByName: user.displayName || 'Anonymous',
      message: message || `${alertType} emergency`,
      lastSeenLocation: null,
      isResolved: false,
      resolvedBy: null,
    });
  }

  async function handleResolveSOS(alertId: string) {
    if (!user) return;

    await resolveSOS(alertId, user.uid, eventId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Guardian Eye - Digital Buddy System
          </h3>
          <p className="text-sm text-gray-600">
            Keep kids safe with check-ins and guardian assignments 👶🏽
          </p>
        </div>
        <Button onClick={() => setIsAddingChild(!isAddingChild)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Child
        </Button>
      </div>

      {/* Active SOS Alerts */}
      {sosAlerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              ACTIVE EMERGENCY ALERTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sosAlerts.map((alert) => (
              <Card key={alert.id} className="border-red-300 bg-white">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-red-600 mb-2">{alert.alertType}</Badge>
                      <p className="font-medium text-lg">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Triggered by: {alert.triggeredByName}
                      </p>
                      {alert.lastSeenLocation && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          Last seen: {alert.lastSeenLocation}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleResolveSOS(alert.id)}
                      variant="outline"
                      className="border-green-500 text-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SOS Buttons */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-700">Emergency Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => handleTriggerSOS('LOST_CHILD')}
              variant="outline"
              className="border-red-500 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Lost Child
            </Button>
            <Button
              onClick={() => handleTriggerSOS('MEDICAL')}
              variant="outline"
              className="border-orange-500 hover:bg-orange-50"
            >
              <Bell className="w-4 h-4 mr-2" />
              Medical
            </Button>
            <Button
              onClick={() => handleTriggerSOS('SECURITY')}
              variant="outline"
              className="border-purple-500 hover:bg-purple-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button
              onClick={() => handleTriggerSOS('WEATHER')}
              variant="outline"
              className="border-blue-500 hover:bg-blue-50"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Weather
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Child Form */}
      {isAddingChild && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Child's Name</label>
                <Input
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  placeholder="e.g., Sarah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  value={newChild.age}
                  onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Allergies (Important!)
                </label>
                <Input
                  value={newChild.allergies}
                  onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Dairy"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Emergency Notes</label>
                <Textarea
                  value={newChild.emergencyNotes}
                  onChange={(e) =>
                    setNewChild({ ...newChild, emergencyNotes: e.target.value })
                  }
                  placeholder="Medical conditions, emergency contacts, etc."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddChild} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
              <Button onClick={() => setIsAddingChild(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Children Check-In Grid */}
      {children.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No children added yet</p>
            <p className="text-sm text-gray-500">
              Add your children to enable safety tracking and check-ins
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {children.map((child) => {
            const latestCheckIn = checkIns
              .filter((c) => c.childId === child.id)
              .sort(
                (a, b) =>
                  new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
              )[0];

            return (
              <Card key={child.id} className="border-blue-200">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Baby className="w-5 h-5 text-blue-600" />
                        {child.name} ({child.age} years old)
                      </h4>
                      {child.allergies && (
                        <Badge className="bg-red-100 text-red-800 mt-1">
                          ⚠️ {child.allergies}
                        </Badge>
                      )}
                      {latestCheckIn && (
                        <div className="mt-2">
                          <Badge
                            className={STATUS_COLORS[latestCheckIn.status as CheckInStatus]}
                          >
                            {STATUS_LABELS[latestCheckIn.status as CheckInStatus]}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            With {latestCheckIn.guardianName}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleTriggerSOS('LOST_CHILD', child.id, `${child.name} is missing!`)}
                      variant="destructive"
                      size="sm"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      SOS
                    </Button>
                  </div>

                  {/* Quick Check-In Buttons */}
                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                    <Button
                      onClick={() => handleCheckIn(child.id, 'SAFE_WITH_PARENT')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      ✅ With Parent
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(child.id, 'PLAYING')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      🎮 Playing
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(child.id, 'WITH_GUARDIAN')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      👤 Guardian
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(child.id, 'EATING')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      🍽️ Eating
                    </Button>
                    <Button
                      onClick={() => handleCheckIn(child.id, 'MISSING')}
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                    >
                      🚨 Missing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Check-Ins Log */}
      {checkIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checkIns.slice(0, 10).map((checkIn: any) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between text-sm py-2 border-b"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[checkIn.status as CheckInStatus]}>
                      {STATUS_LABELS[checkIn.status as CheckInStatus]}
                    </Badge>
                    <span className="font-medium">{checkIn.child?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-3 h-3" />
                    <span className="text-xs">{checkIn.guardianName}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span className="text-xs">
                      {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
