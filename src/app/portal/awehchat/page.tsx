'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AwehChatPortal() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // If desired, add postMessage based handshake here in future
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white">AwehChat Portal</h1>
          <p className="text-sm text-gray-300">Open messaging between clients. If the embedded view is blocked by the remote site, use the "Open in new tab" button.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Embedded Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] bg-black rounded overflow-hidden">
              {!iframeError ? (
                <iframe
                  src="https://www.awehchat.co.za"
                  title="AwehChat"
                  className="w-full h-full border-0"
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-300">
                    <p>Unable to embed AwehChat due to remote site policies.</p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <a href="https://www.awehchat.co.za" target="_blank" rel="noopener noreferrer">
                        <Button>Open in new tab</Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/portal">
            <Button variant="outline">Back to Portal</Button>
          </Link>
          <a href="https://www.awehchat.co.za" target="_blank" rel="noopener noreferrer">
            <Button>Open in new tab</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
