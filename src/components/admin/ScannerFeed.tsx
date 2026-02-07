'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Bell, Clock, QrCode, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRecentScansAction } from '@/app/actions/smart-qr';
import { formatDistanceToNow } from 'date-fns';

interface ScanEntry {
  id: number;
  qrTitle: string;
  scannerName: string;
  scannedAt: Date;
}

export function ScannerFeed() {
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newScanCount, setNewScanCount] = useState(0);
  
  const loadScans = useCallback(async () => {
    try {
      const data = await getRecentScansAction(15);
      
      // Check for new scans
      if (scans.length > 0 && data.length > 0) {
        const latestExisting = scans[0]?.id || 0;
        const newScans = data.filter(s => s.id > latestExisting);
        
        if (newScans.length > 0) {
          setNewScanCount(prev => prev + newScans.length);
          
          // Play ping sound for new scans
          try {
            const audio = new Audio('/sounds/sonar.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Ignore autoplay errors
          } catch (e) {}
        }
      }
      
      setScans(data);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load scans:', error);
      setLoading(false);
    }
  }, [scans]);
  
  // Initial load
  useEffect(() => {
    loadScans();
  }, []);
  
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadScans, 10000);
    return () => clearInterval(interval);
  }, [loadScans]);
  
  const getTypeColor = (title: string) => {
    if (title.toLowerCase().includes('gold')) return 'bg-yellow-500';
    if (title.toLowerCase().includes('task')) return 'bg-orange-500';
    return 'bg-purple-500';
  };
  
  return (
    <Card className="bg-black/40 border-green-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-green-400 animate-pulse" />
            Live Scanner Feed
            {newScanCount > 0 && (
              <Badge variant="destructive" className="ml-2 animate-bounce">
                {newScanCount} new
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              loadScans();
              setNewScanCount(0);
            }}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {loading && scans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <QrCode className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Loading scan history...</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No scans yet</p>
              <p className="text-xs mt-1">QR scans will appear here in real-time</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {scans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    index === 0 ? 'bg-green-500/10' : ''
                  }`}
                >
                  {/* Indicator */}
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(scan.qrTitle)} ${
                    index === 0 ? 'animate-pulse' : ''
                  }`} />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {scan.qrTitle}
                    </p>
                    <p className="text-xs text-gray-400">
                      by {scan.scannerName}
                    </p>
                  </div>
                  
                  {/* Time */}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(scan.scannedAt), { addSuffix: true })}
                  </span>
                  
                  {index === 0 && (
                    <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                      Latest
                    </Badge>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
