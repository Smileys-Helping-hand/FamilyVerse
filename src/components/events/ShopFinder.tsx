'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Globe,
  Phone,
  Clock,
  MapPinIcon,
  Star,
  Navigation,
  Loader,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getShopRecommendations, addShoppingItem } from '@/app/actions/event-budget';

interface ShopFinderProps {
  eventId: string;
  eventLocation?: { lat: number; lng: number; address?: string };
  onShopSelect?: (shop: any) => void;
}

// South African popular shops
const SA_SHOPS = [
  {
    id: 'checkers',
    name: 'Checkers',
    types: ['SUPERMARKET'],
    rating: 4.5,
    description: 'Major supermarket chain',
  },
  {
    id: 'pick_n_pay',
    name: 'Pick n Pay',
    types: ['SUPERMARKET'],
    rating: 4.4,
    description: 'Leading supermarket',
  },
  {
    id: 'shoprite',
    name: 'Shoprite',
    types: ['SUPERMARKET'],
    rating: 4.3,
    description: 'Popular grocery store',
  },
  {
    id: 'makro',
    name: 'Makro',
    types: ['WAREHOUSE'],
    rating: 4.2,
    description: 'Warehouse store',
  },
  {
    id: 'game',
    name: 'Game',
    types: ['SUPERMARKET'],
    rating: 4.1,
    description: 'Electronics & groceries',
  },
  {
    id: 'woolworths',
    name: 'Woolworths',
    types: ['SUPERMARKET'],
    rating: 4.6,
    description: 'Premium supermarket',
  },
];

export default function ShopFinder({
  eventId,
  eventLocation,
  onShopSelect,
}: ShopFinderProps) {
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadShops();
  }, [eventId]);

  const loadShops = async () => {
    setLoading(true);
    const res = await getShopRecommendations(eventId);
    if (res.success && res.shops) {
      setShops(res.shops);
    } else {
      // Demo shops if no recommendations exist
      setShops(SA_SHOPS.map((shop, idx) => ({
        id: shop.id,
        shopName: shop.name,
        shopType: shop.types[0],
        address: `${shop.name} Branch, ${eventLocation?.address || 'Cape Town'}`,
        latitude: (eventLocation?.lat || -33.9249 + Math.random() * 0.1).toString(),
        longitude: (eventLocation?.lng || 18.4241 + Math.random() * 0.1).toString(),
        distance: Math.floor(Math.random() * 5000 + 500),
        rating: shop.rating,
        notes: shop.description,
      })));
    }
    setLoading(false);
  };

  const handleViewDetails = (shop: any) => {
    setSelectedShop(shop);
    setShowDetails(true);
    onShopSelect?.(shop);
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'Distance unknown';
    if (meters < 1000) return `${meters}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const getShopIcon = (type: string) => {
    switch (type) {
      case 'SUPERMARKET':
        return '🛒';
      case 'WAREHOUSE':
        return '📦';
      case 'CONVENIENCE':
        return '🏪';
      default:
        return '🏢';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-100/50 dark:from-emerald-900/20 via-teal-100/30 dark:via-teal-900/10 to-cyan-100/50 dark:to-cyan-900/20 border-2 border-emerald-200 dark:border-emerald-800/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Nearby Shops</h3>
            <p className="text-sm text-foreground/60">
              {shops.length > 0 ? `${shops.length} stores nearby` : 'Finding best shops for you...'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-8 gap-2"
            >
              <Loader className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-foreground/60">Finding nearby shops...</span>
            </motion.div>
          ) : (
            shops.map((shop, idx) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleViewDetails(shop)}
                className="rounded-xl bg-card border-2 border-border hover:border-emerald-300 dark:hover:border-emerald-700 p-4 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-3xl mt-1">{getShopIcon(shop.shopType)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm">{shop.shopName}</h4>
                      {shop.rating && (
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {shop.rating}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-foreground/60 mb-2 line-clamp-2">
                      {shop.address}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {shop.distance && (
                        <span className="flex items-center gap-1 text-foreground/50">
                          <Navigation className="w-3 h-3" />
                          {formatDistance(shop.distance)}
                        </span>
                      )}
                      {shop.notes && (
                        <span className="text-foreground/50">{shop.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-foreground/30 flex-shrink-0 mt-1">
                    →
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Shop Details Modal */}
      <AnimatePresence>
        {showDetails && selectedShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedShop.shopName}</h2>
                  <p className="text-sm text-foreground/60">{selectedShop.address}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-foreground/50 hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedShop.distance && (
                  <div className="rounded-xl bg-muted p-3 text-center">
                    <Navigation className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-foreground/60">Distance</p>
                    <p className="font-bold text-sm">
                      {formatDistance(selectedShop.distance)}
                    </p>
                  </div>
                )}
                {selectedShop.rating && (
                  <div className="rounded-xl bg-muted p-3 text-center">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-foreground/60">Rating</p>
                    <p className="font-bold text-sm">{selectedShop.rating}/5</p>
                  </div>
                )}
                {selectedShop.phone && (
                  <div className="rounded-xl bg-muted p-3 text-center">
                    <Phone className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-foreground/60">Phone</p>
                    <p className="font-bold text-xs">{selectedShop.phone}</p>
                  </div>
                )}
                {selectedShop.website && (
                  <div className="rounded-xl bg-muted p-3 text-center">
                    <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-foreground/60">Website</p>
                    <p className="font-bold text-xs truncate">{selectedShop.website}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(selectedShop.shopName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 transition-all"
                >
                  <MapPinIcon className="w-4 h-4" /> View on Maps
                </a>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full p-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
