"use client";
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getPusherClient } from "@/lib/pusher/client";
import { acknowledgeNotification } from "@/actions/notifications";

  const [open, setOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const unreadCount = localNotifications.filter(n => !n.read).length;

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    // TODO: Replace with real userId from auth
    const userId = "demo-user";
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`notify-${userId}`);
    channel.bind('notification', (data: any) => {
      setLocalNotifications(prev => [
        {
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full bg-gray-900 hover:bg-cyan-700 transition"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-cyan-400 rounded-xl shadow-lg z-50">
          <div className="p-4 border-b border-cyan-400 font-bold text-cyan-300">Notifications</div>
          <ul className="max-h-96 overflow-auto">
            {localNotifications.length === 0 && (
              <li className="p-4 text-gray-400">No notifications yet.</li>
            )}
            {localNotifications.map(n => (
              <li key={n.id} className={`p-4 border-b border-gray-800 ${!n.read ? "bg-cyan-900/30" : "bg-gray-900"}`}>
                <div className="font-semibold text-cyan-200 mb-1">{n.title}</div>
                <div className="text-gray-300 mb-2">{n.message}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
                  {!n.read && (
                    <button
                      className="ml-auto bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600 transition"
                      onClick={async () => {
                        await acknowledgeNotification(Number(n.id));
                        setLocalNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                      }}
                    >Acknowledge</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
