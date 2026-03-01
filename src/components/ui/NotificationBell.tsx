"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { acknowledgeNotification, acknowledgeGearNotification, getUserNotifications } from "@/actions/notifications";
import { useAuth } from "@/context/AuthContext";
import { getPusherClient } from "@/lib/pusher/client";

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string | Date;
  created_at?: string | Date;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const data = await getUserNotifications(user.uid);
      setNotifications(data as Notification[]);
    } catch { /* non-fatal */ }
  }, [user?.uid]);

  // Initial load
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Pusher real-time: listen on notify-[userId] channel
  useEffect(() => {
    if (!user?.uid) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`notify-${user.uid}`);
    channel.bind('notification', (data: Notification) => {
      setNotifications(prev => [{ ...data, read: false }, ...prev]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user?.uid]);

  const getTimestamp = (n: Notification) => {
    const ts = n.createdAt || n.created_at;
    if (!ts) return '';
    return new Date(ts as string).toLocaleString();
  };

  const handleAcknowledge = async (n: Notification) => {
    // For gear notifications, parse item name + event from the message if possible
    if (n.type === 'GEAR_ASSIGNED') {
      const itemMatch = n.message.match(/bring[:\s]+(.+?) for (.+)/i) ||
                        n.message.match(/bring[:\s]+(.+)/i);
      const itemName = itemMatch?.[1]?.trim() ?? '';
      await acknowledgeGearNotification(Number(n.id), user?.uid ?? '', itemName);
    } else {
      await acknowledgeNotification(Number(n.id));
    }
    setNotifications(prev => prev.map(notif =>
      String(notif.id) === String(n.id) ? { ...notif, read: true } : notif
    ));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full bg-gray-900 hover:bg-cyan-700 transition"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-cyan-400 rounded-xl shadow-2xl z-50">
            <div className="p-4 border-b border-cyan-400 font-bold text-cyan-300 flex justify-between items-center">
              <span>🔔 Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <ul className="max-h-96 overflow-auto divide-y divide-gray-800">
              {notifications.length === 0 && (
                <li className="p-4 text-gray-400 text-center text-sm">No notifications yet.</li>
              )}
              {notifications.map(n => (
                <li
                  key={String(n.id)}
                  className={`p-4 ${!n.read ? 'bg-cyan-900/30' : 'bg-gray-900'}`}
                >
                  <div className="font-semibold text-cyan-200 mb-1 text-sm">{n.title}</div>
                  <div className="text-gray-300 text-sm mb-2">{n.message}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{getTimestamp(n)}</span>
                    {!n.read && (
                      <button
                        className="ml-auto bg-[#00FF66] text-black px-3 py-1 rounded text-xs font-bold hover:bg-green-400 transition"
                        onClick={() => handleAcknowledge(n)}
                      >
                        ✓ Acknowledge
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

