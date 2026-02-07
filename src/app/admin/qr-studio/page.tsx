'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { 
  Printer, Download, Share2, Wifi, Link2, Trophy, 
  Type, QrCode, Trash2,
  Palette, Users,
  Gamepad2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// =============================================================================
// Types
// =============================================================================
type ElementType = 'qr' | 'text' | 'icon';

interface CanvasElement {
  id: string;
  type: ElementType;
  content: string;
  size: number;
  x: number;
  y: number;
}

// =============================================================================
// QR Design Studio - WYSIWYG Editor for Thermal Labels
// =============================================================================
export default function QRStudioPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: 'qr-1', type: 'qr', content: 'https://familyverse.app', size: 200, x: 92, y: 50 },
    { id: 'text-1', type: 'text', content: 'SCAN ME', size: 24, x: 142, y: 280 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrData, setQrData] = useState('https://familyverse.app');
  const [inverted, setInverted] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  
  // Quick Action states
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const wifiType = 'WPA';
  
  // Spy Game states
  const [spyCardCount, setSpyCardCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState('https://alphatraders.co.za');

  // =============================================================================
  // Element Management
  // =============================================================================
  const addElement = (type: ElementType, content: string) => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      content,
      size: type === 'qr' ? 150 : type === 'text' ? 20 : 40,
      x: 142,
      y: elements.length * 60 + 50,
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const updateQRData = (data: string) => {
    setQrData(data);
    elements.forEach(el => {
      if (el.type === 'qr') {
        updateElement(el.id, { content: data });
      }
    });
  };

  // =============================================================================
  // Quick Actions
  // =============================================================================
  const generateWifiQR = () => {
    if (!wifiSSID) {
      toast({ title: 'Enter WiFi name', variant: 'destructive' });
      return;
    }
    const wifiString = `WIFI:S:${wifiSSID};T:${wifiType};P:${wifiPassword};;`;
    updateQRData(wifiString);
    toast({ title: '📶 WiFi QR Generated!', description: 'Scan to auto-connect' });
  };

  const generateJoinPartyQR = () => {
    const partyUrl = `${baseUrl}/party/join`;
    updateQRData(partyUrl);
    toast({ title: '🎉 Party Link Generated!' });
  };

  const generateLeaderboardQR = () => {
    const leaderboardUrl = `${baseUrl}/party/leaderboard`;
    updateQRData(leaderboardUrl);
    toast({ title: '🏆 Leaderboard QR Generated!' });
  };

  // =============================================================================
  // Spy Game Batch Generation
  // =============================================================================
  const generateSpyCards = async () => {
    toast({ title: '🕵️ Generating Spy Cards...', description: `Creating ${spyCardCount} unique cards` });
    
    const cards: string[] = [];
    for (let i = 0; i < spyCardCount; i++) {
      const token = btoa(`spy-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`);
      const deepLink = `${baseUrl}/spy/reveal?token=${token}`;
      cards.push(deepLink);
    }
    
    // Set the first card as preview
    updateQRData(cards[0]);
    
    toast({ 
      title: '✅ Spy Cards Ready!', 
      description: `${spyCardCount} unique QR codes generated.` 
    });
    
    return cards;
  };

  // =============================================================================
  // Print Engine
  // =============================================================================
  const captureCanvas = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: inverted ? '#000000' : '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Canvas capture failed:', error);
      return null;
    }
  };

  const downloadPNG = async () => {
    const blob = await captureCanvas();
    if (!blob) {
      toast({ title: 'Export failed', variant: 'destructive' });
      return;
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-sticker-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: '📥 Downloaded!', description: 'PNG ready for printing' });
  };

  const shareToPrinter = async () => {
    const blob = await captureCanvas();
    if (!blob) {
      toast({ title: 'Export failed', variant: 'destructive' });
      return;
    }

    const file = new File([blob], 'qr-sticker.png', { type: 'image/png' });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'QR Sticker',
          text: 'Print this sticker!',
        });
        toast({ title: '🖨️ Sent to Share Sheet!', description: 'Select your printer app' });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({ title: 'Share failed', variant: 'destructive' });
        }
      }
    } else {
      downloadPNG();
    }
  };

  // Icon Library
  const icons = [
    { emoji: '🕵️', label: 'Spy' },
    { emoji: '🏎️', label: 'Car' },
    { emoji: '👻', label: 'Ghost' },
    { emoji: '🎮', label: 'Game' },
    { emoji: '🏆', label: 'Trophy' },
    { emoji: '📶', label: 'WiFi' },
    { emoji: '🎉', label: 'Party' },
    { emoji: '⭐', label: 'Star' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '💎', label: 'Diamond' },
  ];

  // =============================================================================
  // Render
  // =============================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-400" />
            QR Design Studio
          </h1>
          <p className="text-gray-400 mt-1">WYSIWYG editor for thermal label printing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadPNG}>
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <Button onClick={shareToPrinter} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Printer className="w-4 h-4 mr-2" />
            Send to Printer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: The Canvas */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Canvas (384px Thermal Width)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Canvas Container */}
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className={`relative transition-colors ${inverted ? 'bg-black' : 'bg-white'}`}
                style={{ width: 384, minHeight: 400, padding: 16 }}
              >
                {elements.map((element) => (
                  <motion.div
                    key={element.id}
                    className={`absolute cursor-move ${selectedId === element.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                    style={{ left: element.x, top: element.y }}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      updateElement(element.id, {
                        x: element.x + info.offset.x,
                        y: element.y + info.offset.y,
                      });
                    }}
                    onClick={() => setSelectedId(element.id)}
                  >
                    {element.type === 'qr' && (
                      <QRCodeSVG
                        value={element.content || ' '}
                        size={qrSize}
                        bgColor={inverted ? '#000000' : '#ffffff'}
                        fgColor={inverted ? '#ffffff' : '#000000'}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                    {element.type === 'text' && (
                      <p className={`font-bold ${inverted ? 'text-white' : 'text-black'}`} style={{ fontSize: element.size }}>
                        {element.content}
                      </p>
                    )}
                    {element.type === 'icon' && (
                      <span style={{ fontSize: element.size }}>{element.content}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Canvas Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Inverted (White on Black)</Label>
                <Switch checked={inverted} onCheckedChange={setInverted} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">QR Code Size: {qrSize}px</Label>
                <Slider value={[qrSize]} onValueChange={([v]) => setQrSize(v)} min={100} max={350} step={10} />
              </div>

              {selectedId && (
                <Button variant="destructive" size="sm" onClick={() => removeElement(selectedId)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              )}
            </div>

            {/* Add Elements */}
            <div className="mt-6 border-t border-gray-700 pt-4">
              <Label className="text-gray-300 mb-3 block">Add Elements</Label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => addElement('qr', qrData)}>
                  <QrCode className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
                <Button size="sm" variant="outline" onClick={() => addElement('text', 'SCAN ME')}>
                  <Type className="w-4 h-4 mr-1" />
                  Text
                </Button>
                {icons.slice(0, 4).map((icon) => (
                  <Button key={icon.emoji} size="sm" variant="ghost" onClick={() => addElement('icon', icon.emoji)} title={icon.label}>
                    {icon.emoji}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Data Source Tabs */}
        <div className="space-y-4">
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="quick">⚡ Quick Actions</TabsTrigger>
              <TabsTrigger value="spy">🕵️ Spy Cards</TabsTrigger>
              <TabsTrigger value="custom">✏️ Custom</TabsTrigger>
            </TabsList>

            {/* Quick Actions Tab */}
            <TabsContent value="quick" className="space-y-4">
              <Card className="bg-black/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-blue-400" />
                    WiFi Login QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Network Name (SSID)</Label>
                    <Input
                      value={wifiSSID}
                      onChange={(e) => setWifiSSID(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="bg-black/50"
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/50"
                    />
                  </div>
                  <Button onClick={generateWifiQR} className="w-full">
                    <Wifi className="w-4 h-4 mr-2" />
                    Generate WiFi QR
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-black/40 border-green-500/30 cursor-pointer hover:border-green-400 transition-colors" onClick={generateJoinPartyQR}>
                  <CardContent className="p-4 text-center">
                    <Link2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="font-semibold text-white">Join Party Link</p>
                    <p className="text-xs text-gray-400">Party lobby URL</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 border-yellow-500/30 cursor-pointer hover:border-yellow-400 transition-colors" onClick={generateLeaderboardQR}>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="font-semibold text-white">Leaderboard</p>
                    <p className="text-xs text-gray-400">Sim Racing scores</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Spy Game Cards Tab */}
            <TabsContent value="spy" className="space-y-4">
              <Card className="bg-black/40 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-400" />
                    Batch Spy Cards Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Number of Player Cards</Label>
                    <div className="flex gap-2 mt-2">
                      {[6, 8, 10, 12].map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          variant={spyCardCount === n ? 'default' : 'outline'}
                          onClick={() => setSpyCardCount(n)}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Base URL</Label>
                    <Input
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://yourapp.com"
                      className="bg-black/50"
                    />
                  </div>
                  <Button onClick={generateSpyCards} className="w-full bg-gradient-to-r from-red-500 to-orange-500">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Generate {spyCardCount} Spy Cards
                  </Button>
                  <p className="text-xs text-gray-400">
                    Each card contains a unique deep link to the role reveal page.
                  </p>
                </CardContent>
              </Card>

              {/* Icon Palette */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Icon Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map((icon) => (
                      <Button
                        key={icon.emoji}
                        variant="ghost"
                        className="h-12 text-2xl hover:bg-purple-500/20"
                        onClick={() => addElement('icon', icon.emoji)}
                        title={icon.label}
                      >
                        {icon.emoji}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value="custom" className="space-y-4">
              <Card className="bg-black/40 border-gray-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Custom QR Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>QR Code Content</Label>
                    <Input
                      value={qrData}
                      onChange={(e) => updateQRData(e.target.value)}
                      placeholder="https://example.com or any text"
                      className="bg-black/50"
                    />
                  </div>
                  <div>
                    <Label>Add Custom Text</Label>
                    <div className="flex gap-2">
                      <Input id="customText" placeholder="Your text here" className="bg-black/50" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById('customText') as HTMLInputElement;
                          if (input.value) {
                            addElement('text', input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Actions */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Print Engine
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={downloadPNG} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button onClick={shareToPrinter} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Printer
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                💡 Tip: Use "Share to Printer" on mobile to send directly to your FunPrint app!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
