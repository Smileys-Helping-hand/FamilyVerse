'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  Utensils,
  Camera,
  DollarSign,
  ChevronDown,
  Plus,
  Check,
  AlertCircle,
  TrendingUp,
  Loader,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  id: string;
  time: string;
  activity: 'meal' | 'activity' | 'photo' | 'travel' | 'free';
  title: string;
  location?: string;
  duration: number;
  budget?: number;
  description?: string;
  booked?: boolean;
  notes?: string;
}

interface PhotoSpot {
  id: string;
  name: string;
  rating: number;
  distance: number; // km
  lighting: 'golden-hour' | 'daytime' | 'evening';
  description: string;
  accessibilityScore: number; // 1-10
  bestTime: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  distance: number; // km
  reviews: number;
  bookingUrl?: string;
  availableSlots: string[];
  specialOccasions: boolean;
  description: string;
}

interface DayPlan {
  eventId: string;
  date: string;
  city: string;
  budget: number;
  timeSlots: TimeSlot[];
  restaurants: Restaurant[];
  photoSpots: PhotoSpot[];
  totalSpent: number;
  notes: string;
}

interface BirthdayExperiencePlannerProps {
  eventId: string;
  eventDate: string;
  eventTitle?: string;
  location?: { lat: number; lng: number; address?: string };
  budget?: number;
  creatorOnly?: boolean;
  currentUserId?: string;
  creatorId?: string;
}

export default function BirthdayExperiencePlanner({
  eventId,
  eventDate,
  eventTitle = 'Birthday Celebration',
  location,
  budget: initialBudget = 2500,
  creatorOnly = false,
  currentUserId = '',
  creatorId = '',
}: BirthdayExperiencePlannerProps) {
  const isCreator = !creatorOnly || currentUserId === creatorId;
  const [dayPlan, setDayPlan] = useState<DayPlan>({
    eventId,
    date: eventDate,
    city: location?.address?.split(',')[0] || 'Cape Town',
    budget: initialBudget,
    timeSlots: generateDefaultSchedule(),
    restaurants: [],
    photoSpots: [],
    totalSpent: 0,
    notes: '',
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'restaurants' | 'photos' | 'budget'>(
    'timeline'
  );
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location && isCreator) {
      fetchRestaurantRecommendations();
      fetchPhotoLocations();
    }
  }, [location, isCreator]);

  const fetchRestaurantRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/birthday/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: dayPlan.city,
          date: dayPlan.date,
          budget: dayPlan.budget,
          guestCount: 2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDayPlan(prev => ({ ...prev, restaurants: data.data || [] }));
      } else {
        // Fallback to mock data
        const mockRestaurants: Restaurant[] = [
          {
            id: '1',
            name: 'The Test Kitchen',
            cuisine: 'Contemporary SA',
            rating: 4.8,
            priceRange: '$$$',
            distance: 2.1,
            reviews: 342,
            availableSlots: ['18:00', '18:30', '19:00', '19:30', '20:00'],
            specialOccasions: true,
            description: 'Award-winning contemporary dining with stunning views',
          },
          {
            id: '2',
            name: 'Codfather Seafood & Grill',
            cuisine: 'Seafood',
            rating: 4.6,
            priceRange: '$$$',
            distance: 3.5,
            reviews: 518,
            availableSlots: ['18:00', '19:00', '20:00'],
            specialOccasions: true,
            description: 'Fresh seafood with intimate ambiance',
          },
        ];
        setDayPlan(prev => ({ ...prev, restaurants: mockRestaurants }));
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotoLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/birthday/photo-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: dayPlan.city,
          date: dayPlan.date,
          photoStyle: 'romantic',
          timeOfDay: 'golden-hour',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDayPlan(prev => ({ ...prev, photoSpots: data.data || [] }));
      } else {
        // Fallback to mock data
        const mockSpots: PhotoSpot[] = [
          {
            id: '1',
            name: 'Signal Hill at Sunset',
            rating: 4.9,
            distance: 4.2,
            lighting: 'golden-hour',
            description: '360° views, perfect golden hour light',
            accessibilityScore: 8,
            bestTime: '17:00 - 18:30',
          },
          {
            id: '2',
            name: 'Camps Bay Promenade',
            rating: 4.6,
            distance: 6.1,
            lighting: 'golden-hour',
            description: 'Beachfront elegance with mountain backdrop',
            accessibilityScore: 9,
            bestTime: '16:00 - 18:00',
          },
        ];
        setDayPlan(prev => ({ ...prev, photoSpots: mockSpots }));
      }
    } catch (error) {
      console.error('Failed to fetch photo spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlot = (slotId: string, updates: Partial<TimeSlot>) => {
    setDayPlan(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      ),
    }));
  };

  const bookRestaurant = async (restaurant: Restaurant, slot: string) => {
    // In production: call booking API
    console.log(`Booking ${restaurant.name} at ${slot}`);

    // Add to timeline
    const newSlot: TimeSlot = {
      id: `meal-${restaurant.id}`,
      time: slot,
      activity: 'meal',
      title: `Dinner at ${restaurant.name}`,
      location: restaurant.name,
      duration: 120,
      budget: 500, // R500 placeholder
      description: restaurant.description,
      booked: true,
    };

    setDayPlan(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot].sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
      totalSpent: prev.totalSpent + 500,
    }));
  };

  const addPhotoStop = (spot: PhotoSpot) => {
    const newSlot: TimeSlot = {
      id: `photo-${spot.id}`,
      time: spot.bestTime.split(' - ')[0],
      activity: 'photo',
      title: `Photos at ${spot.name}`,
      location: spot.name,
      duration: 60,
      budget: 0,
      description: spot.description,
      booked: false,
      notes: `Golden hour: ${spot.lighting}`,
    };

    setDayPlan(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot].sort((a, b) =>
        a.time.localeCompare(b.time)
      ),
    }));
  };

  const budgetRemaining = dayPlan.budget - dayPlan.totalSpent;
  const budgetPercentage = (dayPlan.totalSpent / dayPlan.budget) * 100;

  if (!isCreator) {
    return (
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Birthday Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Only the event creator can plan the birthday celebration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-none bg-gradient-to-br from-[#FF6B35]/10 to-[#D4A574]/10">
          <CardHeader>
            <CardTitle className="text-3xl">🎂 {eventTitle} - Plan the Perfect Day</CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {(['timeline', 'restaurants', 'photos', 'budget'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className="gap-2"
          >
            {tab === 'timeline' && '📅 Timeline'}
            {tab === 'restaurants' && '🍽️ Restaurants'}
            {tab === 'photos' && '📸 Photo Spots'}
            {tab === 'budget' && '💰 Budget'}
          </Button>
        ))}
        {loading && <Loader className="w-5 h-5 animate-spin ml-auto" />}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#FF6B35]">
                <p className="text-gray-600 text-sm">Total Duration</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">12 hours</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#2D5F5D]">
                <p className="text-gray-600 text-sm">Scheduled Activities</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">
                  {dayPlan.timeSlots.filter(s => s.booked).length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#D4A574]">
                <p className="text-gray-600 text-sm">Photo Stops</p>
                <p className="text-2xl font-bold text-[#1a1a1a]">
                  {dayPlan.timeSlots.filter(s => s.activity === 'photo').length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {dayPlan.timeSlots
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(slot => (
                  <TimelineCard
                    key={slot.id}
                    slot={slot}
                    expanded={expandedSlot === slot.id}
                    onExpand={() =>
                      setExpandedSlot(expandedSlot === slot.id ? null : slot.id)
                    }
                    onUpdate={(updates) => updateTimeSlot(slot.id, updates)}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <motion.div
            key="restaurants"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {dayPlan.restaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onBook={bookRestaurant}
                budgetRemaining={budgetRemaining}
              />
            ))}
          </motion.div>
        )}

        {/* Photo Spots Tab */}
        {activeTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {dayPlan.photoSpots.map(spot => (
              <PhotoSpotCard
                key={spot.id}
                spot={spot}
                onAdd={() => addPhotoStop(spot)}
                isAdded={dayPlan.timeSlots.some(s => s.id === `photo-${spot.id}`)}
              />
            ))}
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <motion.div
            key="budget"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <BudgetBreakdown
              total={dayPlan.budget}
              spent={dayPlan.totalSpent}
              remaining={budgetRemaining}
              percentage={budgetPercentage}
            />

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Spending by Activity</h3>
              <div className="space-y-3">
                {dayPlan.timeSlots
                  .filter(s => s.budget && s.budget > 0)
                  .map(slot => (
                    <div key={slot.id} className="flex items-center justify-between pb-3 border-b">
                      <div>
                        <p className="font-medium text-[#1a1a1a]">{slot.title}</p>
                        <p className="text-sm text-gray-600">{slot.time}</p>
                      </div>
                      <p className="font-bold text-[#FF6B35]">R{slot.budget}</p>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 pt-6"
      >
        <Button variant="outline" className="gap-2">
          💾 Save Plan
        </Button>
        <Button className="gap-2 ml-auto">
          📱 Share on WhatsApp
        </Button>
      </motion.div>
    </div>
  );
}

function TimelineCard({
  slot,
  expanded,
  onExpand,
  onUpdate,
}: {
  slot: TimeSlot;
  expanded: boolean;
  onExpand: () => void;
  onUpdate: (updates: Partial<TimeSlot>) => void;
}) {
  const activityIcon = {
    meal: <Utensils className="w-5 h-5" />,
    activity: <TrendingUp className="w-5 h-5" />,
    photo: <Camera className="w-5 h-5" />,
    travel: <MapPin className="w-5 h-5" />,
    free: <Clock className="w-5 h-5" />,
  }[slot.activity];

  const activityColor = {
    meal: 'from-orange-100 to-orange-50 border-orange-300',
    activity: 'from-blue-100 to-blue-50 border-blue-300',
    photo: 'from-pink-100 to-pink-50 border-pink-300',
    travel: 'from-teal-100 to-teal-50 border-teal-300',
    free: 'from-gray-100 to-gray-50 border-gray-300',
  }[slot.activity];

  return (
    <motion.div
      layout
      onClick={onExpand}
      className={cn(
        'bg-gradient-to-r rounded-lg p-4 border-l-4 cursor-pointer transition-all',
        activityColor
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          <div className="mt-1 text-[#FF6B35]">{activityIcon}</div>
          <div className="flex-1">
            <p className="font-bold text-[#1a1a1a]">{slot.time}</p>
            <p className="text-lg font-semibold text-[#1a1a1a]">{slot.title}</p>
            {slot.location && (
              <p className="text-sm text-gray-600 mt-1">📍 {slot.location}</p>
            )}
            <p className="text-sm text-gray-600">{slot.duration} min</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {slot.booked && <Check className="w-5 h-5 text-green-600" />}
          {slot.budget && (
            <p className="font-bold text-[#FF6B35]">R{slot.budget}</p>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-300 space-y-3"
          >
            {slot.description && (
              <p className="text-sm text-gray-700">{slot.description}</p>
            )}
            {slot.notes && (
              <p className="text-sm italic text-gray-600">Note: {slot.notes}</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ notes: 'Updated' });
              }}
              className="text-sm font-medium text-[#FF6B35] hover:underline"
            >
              Edit Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RestaurantCard({
  restaurant,
  onBook,
  budgetRemaining,
}: {
  restaurant: Restaurant;
  onBook: (restaurant: Restaurant, slot: string) => void;
  budgetRemaining: number;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="glass-card border-none h-full flex flex-col">
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#D4A574] h-32 flex items-end p-4">
          <div>
            <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>
            <p className="text-white/90">{restaurant.cuisine}</p>
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="text-yellow-500 font-bold">{'⭐'.repeat(Math.floor(restaurant.rating))}</span>
              <span className="text-gray-600">{restaurant.rating.toFixed(1)} ({restaurant.reviews})</span>
            </div>
            <span className="font-bold text-[#FF6B35]">{restaurant.priceRange}</span>
          </div>

          <p className="text-sm text-gray-600">{restaurant.description}</p>

          <div className="flex gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{restaurant.distance} km away</span>
          </div>

          {restaurant.specialOccasions && (
            <div className="bg-blue-50 border border-blue-300 rounded p-2 text-sm">
              ✨ Special occasions welcome
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Available times:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {restaurant.availableSlots.map(slot => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => {
                if (selectedSlot) onBook(restaurant, selectedSlot);
              }}
              disabled={!selectedSlot || budgetRemaining < 500}
              className="w-full"
            >
              {selectedSlot ? 'Book Reservation' : 'Select Time'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PhotoSpotCard({
  spot,
  onAdd,
  isAdded,
}: {
  spot: PhotoSpot;
  onAdd: () => void;
  isAdded: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="glass-card border-none h-full flex flex-col"
      >
      <div className="bg-gradient-to-r from-pink-400 to-[#D4A574] h-32 flex items-end p-4">
        <h3 className="text-xl font-bold text-white">{spot.name}</h3>
      </div>

      <CardContent className="p-4 space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className="text-yellow-500">{'⭐'.repeat(Math.floor(spot.rating))}</span>
            <span className="text-gray-600">{spot.rating.toFixed(1)}</span>
          </div>
          <span className={cn(
            'text-xs font-bold px-2 py-1 rounded',
            spot.lighting === 'golden-hour'
              ? 'bg-yellow-100 text-yellow-800'
              : spot.lighting === 'daytime'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          )}>
            {spot.lighting === 'golden-hour' ? '🌅' : '☀️'} {spot.lighting}
          </span>
        </div>

        <p className="text-sm text-gray-600">{spot.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex gap-2 items-center">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{spot.distance} km away</span>
          </div>
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Best: {spot.bestTime}</span>
          </div>
          <div className="flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span>Access: {spot.accessibilityScore}/10</span>
          </div>
        </div>

        <Button
          onClick={onAdd}
          disabled={isAdded}
          variant={isAdded ? 'outline' : 'default'}
          className="w-full mt-4"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added to Timeline
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add to Timeline
            </>
          )}
        </Button>
      </CardContent>
      </Card>
    </motion.div>
  );
}

function BudgetBreakdown({
  total,
  spent,
  remaining,
  percentage,
}: {
  total: number;
  spent: number;
  remaining: number;
  percentage: number;
}) {
  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-blue-700">R{total.toLocaleString()}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Allocated</p>
          <p className="text-2xl font-bold text-orange-700">R{spent.toLocaleString()}</p>
        </div>
        <div className={cn(
          'text-center p-4 rounded-lg',
          remaining > 0
            ? 'bg-gradient-to-br from-green-50 to-green-100'
            : 'bg-gradient-to-br from-red-50 to-red-100'
        )}>
          <p className="text-sm text-gray-600 mb-1">Remaining</p>
          <p className={cn(
            'text-2xl font-bold',
            remaining > 0 ? 'text-green-700' : 'text-red-700'
          )}>
            R{remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            className="bg-gradient-to-r from-[#FF6B35] to-[#D4A574] h-full rounded-full transition-all duration-500"
          />
        </div>
        <p className="text-sm text-gray-600">
          {percentage.toFixed(0)}% of budget allocated
        </p>
      </div>
      </CardContent>
    </Card>
  );
}

function generateDefaultSchedule(): TimeSlot[] {
  return [
    {
      id: 'morning-1',
      time: '09:00',
      activity: 'free',
      title: 'Sleep in & Breakfast',
      duration: 120,
      description: 'Start the day relaxed with your favorite breakfast',
    },
    {
      id: 'morning-2',
      time: '11:00',
      activity: 'activity',
      title: 'Couple Activity',
      duration: 180,
      description: 'Choose a favorite activity - hiking, spa, shopping, etc.',
    },
    {
      id: 'lunch',
      time: '14:00',
      activity: 'meal',
      title: 'Lunch',
      location: 'Casual spot',
      duration: 90,
      budget: 300,
    },
    {
      id: 'photo-1',
      time: '16:00',
      activity: 'photo',
      title: 'Photo Session',
      duration: 120,
      description: 'Capture golden hour memories at scenic location',
    },
    {
      id: 'dinner',
      time: '18:30',
      activity: 'meal',
      title: 'Special Dinner',
      location: 'Fine Dining',
      duration: 150,
      budget: 700,
      description: 'Romantic celebration dinner',
    },
  ];
}
