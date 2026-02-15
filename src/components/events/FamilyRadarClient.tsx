'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Navigation,
  MapPin,
  Radio,
  Ghost,
  ArrowLeft,
  Phone,
  AlertCircle,
  MapPinned,
  Cross,
  ShieldAlert,
  Pill,
  ShoppingCart,
  Fuel,
  Baby,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  updateLiveLocation,
  toggleGhostMode,
  getEventLocations,
  addMeetHerePin,
  getMeetHerePins,
} from '@/app/actions/events';
import { 
  fetchNearbyPlaces, 
  getTacticalLocations 
} from '@/app/actions/events-extended';
import { getPusherClient } from '@/lib/pusher/client';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

interface FamilyRadarClientProps {
  event: any;
  attendees: any[];
  currentUser: {
    uid: string;
    email: string;
    name: string;
  };
}

// Fix for default marker icons
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function LocationMarker({ userId, userName, position, speed, isCurrentUser }: any) {
  const isIdle = speed !== undefined && speed < 5; // Less than 5 km/h considered idle

  return (
    <Marker position={position}>
      <Popup>
        <div className="text-center p-2">
          <Avatar className="h-12 w-12 mx-auto mb-2">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{userName}</p>
          {isCurrentUser && <Badge className="mt-1">You</Badge>}
          {speed !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {isIdle ? '🛑 Idle' : `🚗 ${Math.round(speed)} km/h`}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function MeetHereMarker({ pin, onCall }: any) {
  return (
    <Marker
      position={[parseFloat(pin.latitude), parseFloat(pin.longitude)]}
      icon={new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })}
    >
      <Popup>
        <div className="p-2">
          <p className="font-semibold mb-1">📍 Meet Here!</p>
          <p className="text-sm mb-2">{pin.message || `Pinned by ${pin.creatorName}`}</p>
        </div>
      </Popup>
    </Marker>
  );
}

const TACTICAL_ICONS: Record<string, { emoji: string; color: string; icon: any }> = {
  HOSPITAL: { emoji: '🏥', color: 'red', icon: Cross },
  POLICE: { emoji: '👮', color: 'blue', icon: ShieldAlert },
  PHARMACY: { emoji: '💊', color: 'green', icon: Pill },
  SUPERMARKET: { emoji: '🛒', color: 'orange', icon: ShoppingCart },
  GAS_STATION: { emoji: '⛽', color: 'yellow', icon: Fuel },
  PLAYGROUND: { emoji: '🎮', color: 'pink', icon: Baby },
};

function TacticalMarker({ location }: any) {
  const config = TACTICAL_ICONS[location.locationType] || TACTICAL_ICONS.HOSPITAL;
  
  return (
    <Marker
      position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
      icon={new Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${config.color}.png`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [20, 33],
        iconAnchor: [10, 33],
        popupAnchor: [0, -28],
      })}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <p className="font-semibold mb-1 flex items-center gap-2">
            {config.emoji} {location.name}
          </p>
          <p className="text-xs text-gray-600 mb-2">{location.address}</p>
          {location.phoneNumber && (
            <a
              href={`tel:${location.phoneNumber}`}
              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
            >
              <Phone className="w-3 h-3" />
              {location.phoneNumber}
            </a>
          )}
          {location.isOpen !== null && (
            <p className="text-xs mt-1">
              {location.isOpen ? '✅ Open now' : '🔒 Closed'}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FamilyRadarClient({ event, attendees, currentUser }: FamilyRadarClientProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [pins, setPins] = useState<any[]>([]);
  const [tacticalLocations, setTacticalLocations] = useState<any[]>([]);
  const [showTacticalMap, setShowTacticalMap] = useState(false);
  const [loadingTactical, setLoadingTactical] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const eventCenter: LatLngExpression = event.coordinates
    ? [event.coordinates.lat, event.coordinates.lng]
    : [-33.9249, 18.4241]; // Default to Cape Town

  useEffect(() => {
    loadLocations();
    loadPins();
    loadTacticalLocations();
  }, []);

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`presence-event-${event.id}`);

    channel.bind('location-update', (data: any) => {
      setLocations(prev => {
        const existing = prev.find(loc => loc.userId === data.userId);
        if (existing) {
          return prev.map(loc =>
            loc.userId === data.userId
              ? {
                  ...loc,
                  latitude: data.latitude,
                  longitude: data.longitude,
                  speed: data.speed,
                  accuracy: data.accuracy,
                }
              : loc
          );
        } else {
          return [...prev, data];
        }
      });
    });

    channel.bind('ghost-mode-toggle', (data: any) => {
      if (data.enabled) {
        setLocations(prev => prev.filter(loc => loc.userId !== data.userId));
      }
    });

    channel.bind('meet-here-pin', () => {
      loadPins();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [event.id]);

  const loadLocations = async () => {
    const result = await getEventLocations(event.id);
    if (result.success) {
      setLocations(result.locations);
    }
  };

  const loadPins = async () => {
    const result = await getMeetHerePins(event.id);
    if (result.success) {
      setPins(result.pins);
    }
  };

  const loadTacticalLocations = async () => {
    const result = await getTacticalLocations(event.id);
    if (result.success && result.locations.length > 0) {
      setTacticalLocations(result.locations);
    } else if (event.coordinates) {
      // If no cached locations, fetch from Google Places
      setLoadingTactical(true);
      const fetchResult = await fetchNearbyPlaces(
        event.id,
        event.coordinates.lat,
        event.coordinates.lng
      );
      if (fetchResult.success && fetchResult.locations) {
        setTacticalLocations(fetchResult.locations);
      }
      setLoadingTactical(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed: gpsSpeed, accuracy } = position.coords;
        setCurrentPosition([latitude, longitude]);

        // Broadcast every 30 seconds
        const now = Date.now();
        if (now - lastUpdateRef.current > 30000) {
          lastUpdateRef.current = now;
          
          const speedKmh = gpsSpeed ? gpsSpeed * 3.6 : 0; // Convert m/s to km/h
          
          updateLiveLocation({
            eventId: event.id,
            userId: currentUser.uid,
            userName: currentUser.name,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            accuracy: Math.round(accuracy || 0),
            speed: Math.round(speedKmh),
            isGhostMode: ghostMode,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Location Error',
          description: 'Failed to get your location. Please check permissions.',
          variant: 'destructive',
        });
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const handleGhostModeToggle = async (enabled: boolean) => {
    setGhostMode(enabled);
    const result = await toggleGhostMode(event.id, currentUser.uid, enabled);
    
    if (result.success) {
      toast({
        title: enabled ? 'Ghost Mode ON' : 'Ghost Mode OFF',
        description: enabled
          ? 'Your location is now hidden from others'
          : 'Your location is now visible to others',
      });
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const message = prompt('Add a message for this pin (optional):');
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expire in 30 minutes

    const result = await addMeetHerePin({
      eventId: event.id,
      creatorId: currentUser.uid,
      creatorName: currentUser.name,
      latitude: lat.toString(),
      longitude: lng.toString(),
      message: message || undefined,
      expiresAt,
    });

    if (result.success) {
      toast({
        title: 'Pin Added',
        description: 'Everyone has been notified!',
      });
      loadPins();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/events/${event.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Navigation className="h-6 w-6 text-blue-500" />
                Family Radar
              </h1>
              <p className="text-sm text-muted-foreground">{event.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tactical Map Toggle */}
            <div className="flex items-center gap-2">
              <MapPinned className={`h-5 w-5 ${showTacticalMap ? 'text-red-500' : 'text-muted-foreground'}`} />
              <Label htmlFor="tactical-map" className="cursor-pointer">Safety Layer</Label>
              <Switch
                id="tactical-map"
                checked={showTacticalMap}
                onCheckedChange={(checked) => {
                  setShowTacticalMap(checked);
                  if (checked && tacticalLocations.length === 0) {
                    loadTacticalLocations();
                  }
                }}
              />
            </div>

            {/* Ghost Mode Toggle */}
            <div className="flex items-center gap-2">
              <Ghost className={`h-5 w-5 ${ghostMode ? 'text-purple-500' : 'text-muted-foreground'}`} />
              <Label htmlFor="ghost-mode" className="cursor-pointer">Ghost Mode</Label>
              <Switch
                id="ghost-mode"
                checked={ghostMode}
                onCheckedChange={handleGhostModeToggle}
              />
            </div>

            {/* Tracking Toggle */}
            {!tracking ? (
              <Button onClick={startTracking} className="gap-2">
                <Radio className="h-4 w-4" />
                Start Tracking
              </Button>
            ) : (
              <Button onClick={stopTracking} variant="destructive" className="gap-2">
                <Radio className="h-4 w-4 animate-pulse" />
                Stop Tracking
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={eventCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* Event Location Marker */}
          {event.coordinates && (
            <Marker position={[event.coordinates.lat, event.coordinates.lng]}>
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold">📍 Event Location</p>
                  <p className="text-sm">{event.locationName}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* User Locations */}
          {locations.map(location => (
            <LocationMarker
              key={location.userId}
              userId={location.userId}
              userName={location.userName}
              position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
              speed={location.speed}
              isCurrentUser={location.userId === currentUser.uid}
            />
          ))}

          {/* Current User (if tracking) */}
          {currentPosition && (
            <LocationMarker
              userId={currentUser.uid}
              userName={currentUser.name}
              position={currentPosition}
              isCurrentUser={true}
            />
          )}

          {/* Meet Here Pins */}
          {pins.map(pin => (
            <MeetHereMarker key={pin.id} pin={pin} />
          ))}

          {/* Tactical Locations */}
          {showTacticalMap && tacticalLocations.map(location => (
            <TacticalMarker key={location.id} location={location} />
          ))}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" />
                <p className="font-semibold">Active Trackers</p>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.map(location => {
                  const isIdle = location.speed !== undefined && location.speed < 5;
                  return (
                    <div
                      key={location.userId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{location.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{location.userName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isIdle ? (
                          <Badge variant="secondary">🛑 Idle</Badge>
                        ) : (
                          <Badge variant="outline">{Math.round(location.speed)} km/h</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {locations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active trackers yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="w-64 bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Tap the map to add a "Meet Here" pin
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Everyone will be notified where to meet!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tactical Map Legend */}
          {showTacticalMap && (
            <Card className="w-64 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinned className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-900">Safety Layer</p>
                </div>
                <div className="space-y-1 text-xs">
                  {Object.entries(TACTICAL_ICONS).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span>{value.emoji}</span>
                      <span className="text-gray-700">
                        {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
                {loadingTactical && (
                  <p className="text-xs text-gray-600 mt-2">Loading nearby places...</p>
                )}
                {tacticalLocations.length === 0 && !loadingTactical && (
                  <p className="text-xs text-gray-600 mt-2">
                    No nearby locations found (add GOOGLE_PLACES_API_KEY)
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { Users } from 'lucide-react';
