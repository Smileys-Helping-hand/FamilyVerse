'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Floating Action Button for AwehChat Integration
 * Opens AwehChat portal in a new tab/PWA window
 */
export function AwehChatFAB() {
  const [showBadge, setShowBadge] = useState(true);

  const openAwehChat = () => {
    setShowBadge(false);
    // Prefer internal portal route so we can attempt embedding
    // Open in a new tab to keep user in the app
    window.open('/portal/awehchat', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        onClick={openAwehChat}
        className="rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative group"
        aria-label="Open AwehChat"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        
        {/* Notification Badge */}
        {showBadge && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg animate-pulse">
            1
          </span>
        )}

        {/* Hover Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
          Open AwehChat
        </span>
      </Button>
    </div>
  );
}

/**
 * Trash Talk Button for Sim Racing Leaderboard
 * Opens AwehChat with optional deep linking
 */
interface TrashTalkButtonProps {
  driverName: string;
  driverId?: string;
}

export function TrashTalkButton({ driverName, driverId }: TrashTalkButtonProps) {
  const handleTrashTalk = () => {
    // If deep linking is supported in the future, you can add the driver ID to the URL
    // For now, just open the main AwehChat site
    const url = driverId 
      ? `https://www.awehchat.co.za/chat?user=${encodeURIComponent(driverId)}`
      : 'https://www.awehchat.co.za';
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTrashTalk}
      className="gap-2 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      Trash Talk
    </Button>
  );
}
