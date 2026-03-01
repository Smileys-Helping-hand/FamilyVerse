"use client";
import { useEffect, useState } from 'react';

export default function PushSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function subscribeToPush() {
    setError('');
    if (!('serviceWorker' in navigator)) {
      setError('Service Worker not supported.');
      return;
    }
    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setError('Notification permission denied.');
        return;
      }
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const response = await fetch('/api/push/vapid-public-key');
      const vapidPublicKey = await response.text();
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      setSubscribed(true);
    } catch (err) {
      setError('Failed to subscribe: ' + err);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Enable Device Push Notifications</h2>
      {subscribed ? (
        <div className="text-green-600 font-semibold">✅ Push notifications enabled!</div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">
            Get notified about events, games, and crew activity even when the app is closed.
          </p>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            onClick={subscribeToPush}
          >
            Enable Notifications
          </button>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </>
      )}
    </div>
  );
}
