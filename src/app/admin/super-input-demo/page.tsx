'use client';

import { useState } from 'react';
import { RichInput } from '@/components/ui/RichInput';
import { VirtualKeyboard } from '@/components/ui/VirtualKeyboard';
import { useVirtualKeyboard } from '@/hooks/useVirtualKeyboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone,
  Monitor,
  Keyboard as KeyboardIcon,
  MessageSquare,
  Rocket,
  Gamepad2,
} from 'lucide-react';
import Link from 'next/link';

export default function SuperInputDemo() {
  const { toast } = useToast();
  const [mobileMessage, setMobileMessage] = useState('');
  const [kioskInput, setKioskInput] = useState('');
  const [numpadValue, setNumpadValue] = useState('');
  
  const {
    showKeyboard,
    keyboardMode,
    isKioskMode,
    hideKeyboard,
    showKeyboardWithMode,
  } = useVirtualKeyboard({ autoShow: false });

  const handleSendMessage = () => {
    if (!mobileMessage.trim()) return;
    toast({
      title: '🚀 Message Sent!',
      description: mobileMessage,
    });
    setMobileMessage('');
  };

  const handleKioskSubmit = () => {
    if (!kioskInput.trim()) return;
    toast({
      title: '✅ Submitted!',
      description: kioskInput,
    });
    setKioskInput('');
  };

  const handleNumpadEnter = () => {
    if (!numpadValue) return;
    toast({
      title: '💰 Bet Placed!',
      description: `You bet ${numpadValue} coins`,
    });
    setNumpadValue('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-purple-400" />
              Super Input Suite
            </h1>
            <p className="text-slate-400 mt-2">
              Rich emoji inputs for mobile + Virtual keyboards for TV/Kiosk mode
            </p>
          </div>
          <Link href="/admin/control">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Info Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-500/10 border-blue-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Smartphone className="w-5 h-5" />
                Mobile Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-200 text-sm">
              WhatsApp-style chat with emoji picker, quick reactions, and rocket send animation
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Monitor className="w-5 h-5" />
                Kiosk Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-200 text-sm">
              Large neon-themed virtual keyboard for Sim Rig and TV Mode
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mobile" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="mobile">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Chat
            </TabsTrigger>
            <TabsTrigger value="kiosk">
              <KeyboardIcon className="w-4 h-4 mr-2" />
              Kiosk Mode
            </TabsTrigger>
          </TabsList>

          {/* Mobile/Desktop Rich Input */}
          <TabsContent value="mobile" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Rich Input Component</CardTitle>
                <CardDescription>
                  Perfect for party chat, trash talk, and live commentary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-purple-400">✨ Features:</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Quick reaction emojis (🏎️ 🏁 🚨 🥩 🍺 😱)</li>
                      <li>• Full emoji picker with search</li>
                      <li>• Auto-resizing textarea (1-4 rows)</li>
                      <li>• Rocket send button with particles</li>
                      <li>• Character counter</li>
                      <li>• Enter to send, Shift+Enter for new line</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-pink-400">🎨 Styling:</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Glassmorphism effect</li>
                      <li>• Gradient borders on focus</li>
                      <li>• Smooth animations</li>
                      <li>• Dark theme optimized</li>
                      <li>• Rotating placeholders</li>
                      <li>• WhatsApp-inspired UX</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Demo */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Try It Out:</h3>
                  <RichInput
                    value={mobileMessage}
                    onChange={setMobileMessage}
                    onSend={handleSendMessage}
                    maxLength={500}
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    💡 Tip: Click the emoji quick reactions above, open the picker, or type and hit Enter
                  </p>
                </div>

                {/* Message Display */}
                {mobileMessage && (
                  <Card className="bg-slate-900/50 border-purple-500/50">
                    <CardHeader>
                      <CardTitle className="text-sm text-purple-300">Live Preview:</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white whitespace-pre-wrap">{mobileMessage}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Code Example */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Usage Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-green-400">
{`import { RichInput } from '@/components/ui/RichInput';

function PartyChat() {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    sendMessage(message);
    setMessage('');
  };
  
  return (
    <RichInput
      value={message}
      onChange={setMessage}
      onSend={handleSend}
      placeholder="Trash talk goes here..."
      maxLength={500}
    />
  );
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kiosk/TV Mode Virtual Keyboard */}
          <TabsContent value="kiosk" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Virtual Keyboard</CardTitle>
                <CardDescription>
                  Neon-themed on-screen keyboard for touchscreen and TV Mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-400">⌨️ Full Keyboard:</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• QWERTY layout</li>
                      <li>• Shift for capitals</li>
                      <li>• 60px tall keys (easy tapping)</li>
                      <li>• Neon blue borders</li>
                      <li>• Glowing effects on press</li>
                      <li>• Perfect for names, text</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-400">🔢 Numpad Mode:</h3>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 0-9 number keys</li>
                      <li>• 80px tall keys</li>
                      <li>• Large font (32px)</li>
                      <li>• Backspace & Enter</li>
                      <li>• Perfect for betting</li>
                      <li>• Quick coin input</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Full Keyboard Demo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Full Keyboard Demo:</h3>
                    <Button
                      onClick={() => showKeyboardWithMode('full')}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-300"
                    >
                      <KeyboardIcon className="w-4 h-4 mr-2" />
                      Show Keyboard
                    </Button>
                  </div>
                  <input
                    type="text"
                    value={kioskInput}
                    onChange={(e) => setKioskInput(e.target.value)}
                    onFocus={() => showKeyboardWithMode('full')}
                    placeholder="Click here or 'Show Keyboard' button..."
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none text-lg"
                  />
                </div>

                {/* Numpad Demo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Numpad Mode Demo:</h3>
                    <Button
                      onClick={() => showKeyboardWithMode('numpad')}
                      variant="outline"
                      size="sm"
                      className="border-green-500/50 text-green-300"
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Show Numpad
                    </Button>
                  </div>
                  <input
                    type="number"
                    value={numpadValue}
                    onChange={(e) => setNumpadValue(e.target.value)}
                    onFocus={() => showKeyboardWithMode('numpad')}
                    placeholder="Enter bet amount..."
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-green-500 focus:outline-none text-2xl font-bold text-center"
                  />
                </div>

                {/* Auto-Detection Notice */}
                {isKioskMode && (
                  <Card className="bg-purple-500/10 border-purple-500/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-purple-400 text-purple-300">
                          Kiosk Mode Detected
                        </Badge>
                        <p className="text-sm text-purple-200">
                          Virtual keyboard will auto-show when inputs are focused
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Code Example */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Usage Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs text-green-400">
{`import { VirtualKeyboard } from '@/components/ui/VirtualKeyboard';
import { useVirtualKeyboard } from '@/hooks/useVirtualKeyboard';

function BettingForm() {
  const [amount, setAmount] = useState('');
  const { showKeyboard, keyboardMode, hideKeyboard } = 
    useVirtualKeyboard({ mode: 'numpad' });
  
  return (
    <>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Bet amount..."
      />
      
      <VirtualKeyboard
        show={showKeyboard}
        mode={keyboardMode}
        onChange={setAmount}
        onClose={hideKeyboard}
        theme="neon"
      />
    </>
  );
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Guide */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              Where to Use These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-300">💬 Party Chat</h3>
                <p className="text-sm text-slate-300">
                  Replace basic textarea with RichInput for emoji-powered trash talk
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-pink-300">🏎️ Sim Rig</h3>
                <p className="text-sm text-slate-300">
                  Use VirtualKeyboard (numpad) for lap time and bet input
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-300">📺 TV Mode</h3>
                <p className="text-sm text-slate-300">
                  Auto-show full keyboard when guests need to type on big screen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Virtual Keyboard Component */}
      <VirtualKeyboard
        show={showKeyboard}
        mode={keyboardMode}
        onChange={keyboardMode === 'full' ? setKioskInput : setNumpadValue}
        onClose={hideKeyboard}
        onKeyPress={(button) => {
          if (button === '{enter}') {
            if (keyboardMode === 'numpad') {
              handleNumpadEnter();
            } else {
              handleKioskSubmit();
            }
          }
        }}
        theme="neon"
      />
    </div>
  );
}
