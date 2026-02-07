'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { MessageSquare, ExternalLink, Shield, Loader2 } from 'lucide-react';

export default function AwehChatPortal() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [storageAccessGranted, setStorageAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [useIframe, setUseIframe] = useState(false);

  // Check if Storage Access API is available and if we already have access
  useEffect(() => {
    const checkStorageAccess = async () => {
      try {
        // Check if Storage Access API is supported
        if ('hasStorageAccess' in document) {
          const hasAccess = await document.hasStorageAccess();
          if (hasAccess) {
            setStorageAccessGranted(true);
          }
        } else {
          // API not supported - proceed with iframe anyway
          setStorageAccessGranted(true);
        }
      } catch (err) {
        console.log('Storage access check failed:', err);
        // On error, default to showing iframe
        setStorageAccessGranted(true);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    checkStorageAccess();
  }, []);

  // Request storage access (required by Safari and privacy-focused browsers)
  const requestStorageAccess = useCallback(async () => {
    try {
      if ('requestStorageAccess' in document) {
        await document.requestStorageAccess();
        setStorageAccessGranted(true);
      } else {
        // API not supported - just show iframe
        setStorageAccessGranted(true);
      }
    } catch (err) {
      console.error('Storage access request failed:', err);
      // If denied, suggest using popup instead
      setUseIframe(false);
    }
  }, []);

  // Open chat in a popup window (works 100% of the time)
  const openChatPopup = useCallback(() => {
    const width = 420;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      'https://www.awehchat.co.za',
      'AwehChat',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="h-10 w-10 text-purple-400" />
            AwehChat Portal
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Secure messaging between clients. Some browsers block embedded logins, so popup mode is the most reliable.
          </p>
        </div>

        {checkingAccess ? (
          <Card className="mb-6">
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Checking connection...</p>
              </div>
            </CardContent>
          </Card>
        ) : !storageAccessGranted && useIframe ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Connection Required
              </CardTitle>
              <CardDescription>
                Your browser requires permission to connect to AwehChat securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to enable secure chat access. If this doesn't work, 
                you can use the popup option which works on all browsers.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={requestStorageAccess}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Connect to Chat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={openChatPopup}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Popup Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : useIframe ? (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Embedded Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden border border-border">
                {!iframeError ? (
                  <>
                    {!iframeLoaded && (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                      </div>
                    )}
                    <iframe
                      src="https://www.awehchat.co.za"
                      title="AwehChat"
                      className={`w-full h-full border-0 ${iframeLoaded ? 'block' : 'hidden'}`}
                      onLoad={() => setIframeLoaded(true)}
                      onError={() => setIframeError(true)}
                      allow="storage-access"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-300 p-6">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                      <p className="mb-2 font-medium">Unable to embed AwehChat</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        The chat app blocked embedding. Use the popup for full functionality.
                      </p>
                      <Button onClick={openChatPopup}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Chat Popup
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setUseIframe(false)}>
                  Use Popup Mode
                </Button>
                <Button onClick={openChatPopup} variant="secondary">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Popup
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Popup Mode
              </CardTitle>
              <CardDescription>
                Your browser prefers popup windows for secure third-party access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to open AwehChat in a dedicated window. 
                This ensures login and all features work properly.
              </p>
              <Button 
                onClick={openChatPopup}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Open Chat Popup
              </Button>
              <Button variant="outline" onClick={() => setUseIframe(true)}>
                Try Embedded View
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/portal">
            <Button variant="outline">Back to Portal</Button>
          </Link>
          <Button onClick={openChatPopup} variant="secondary">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Popup
          </Button>
          <Button variant="ghost" onClick={() => setUseIframe(true)}>
            Try Embedded View
          </Button>
          <a href="https://www.awehchat.co.za" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">
              Open in New Tab
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
