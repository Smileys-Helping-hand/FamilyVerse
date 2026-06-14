'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  ShoppingCart,
  MapPin,
  Settings,
  ChevronDown,
  Share2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BudgetTracker from './BudgetTracker';
import ShoppingList from './ShoppingList';
import ShopFinder from './ShopFinder';
import WhatsAppInvite from './WhatsAppInvite';
import BudgetBreakdown from './BudgetBreakdown';

interface EventPlanningDashboardProps {
  eventId: string;
  eventTitle: string;
  eventLocation?: { lat: number; lng: number; address?: string };
  currentUserId: string;
  currentUserName: string;
  attendeeCount?: number;
}

const TABS = [
  { id: 'budget', label: '💰 Budget', icon: BarChart3 },
  { id: 'shopping', label: '🛒 Shopping', icon: ShoppingCart },
  { id: 'shops', label: '🏪 Shops', icon: MapPin },
];

export default function EventPlanningDashboard({
  eventId,
  eventTitle,
  eventLocation,
  currentUserId,
  currentUserName,
  attendeeCount = 0,
}: EventPlanningDashboardProps) {
  const [activeTab, setActiveTab] = useState('budget');
  const [showSettings, setShowSettings] = useState(false);

  const handleShare = () => {
    const text = `Planning for ${eventTitle}? Check out the event budget & shopping list on FamilyVerse!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Invite Section - PROMINENT */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-[#25D366]/20 via-emerald-100/10 to-teal-100/10 border-2 border-[#25D366]/30 p-6 md:p-8"
      >
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-[#25D366] mb-1 flex items-center gap-2">
            📱 Share Event on WhatsApp
          </h3>
          <p className="text-sm text-foreground/70">
            Invite cousins in seconds - they join with one tap!
          </p>
        </div>
        <WhatsAppInvite
          eventId={eventId}
          eventTitle={eventTitle}
          guestCount={attendeeCount}
          budgetAmount={10000} // R100 default
        />
      </motion.div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-2 border-primary/20 p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
              {eventTitle}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm text-foreground/70">
              {eventLocation?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {eventLocation.address}
                </span>
              )}
              {attendeeCount > 0 && (
                <span>👥 {attendeeCount} people</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white/40 dark:bg-white/5 p-3">
            <p className="text-xs text-foreground/60 mb-1">Status</p>
            <p className="font-bold text-sm">Planning</p>
          </div>
          <div className="rounded-lg bg-white/40 dark:bg-white/5 p-3">
            <p className="text-xs text-foreground/60 mb-1">Progress</p>
            <p className="font-bold text-sm">Active</p>
          </div>
          <div className="rounded-lg bg-white/40 dark:bg-white/5 p-3">
            <p className="text-xs text-foreground/60 mb-1">Team</p>
            <p className="font-bold text-sm">{attendeeCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 rounded-xl bg-muted p-1"
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all',
                isActive
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label.split(' ')[1]}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <BudgetBreakdown
                eventId={eventId}
                totalPerPerson={10000}
                attendeeCount={attendeeCount}
              />
              <BudgetTracker
                eventId={eventId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </div>
          )}

          {activeTab === 'shopping' && (
            <ShoppingList
              eventId={eventId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              eventLocation={eventLocation}
            />
          )}

          {activeTab === 'shops' && (
            <ShopFinder
              eventId={eventId}
              eventLocation={eventLocation}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Helpful Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 p-4"
      >
        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>✓ Set a budget to track contributions from everyone</li>
          <li>✓ Add items to shopping list & assign to team members</li>
          <li>✓ Browse nearby shops for best deals</li>
          <li>✓ Share the event link via WhatsApp to coordinate</li>
        </ul>
      </motion.div>
    </div>
  );
}
