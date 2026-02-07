'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { 
  Printer, Download, Wifi, Users, Car, Gamepad2,
  Scissors, RefreshCw, Sparkles, Wand2, Trash2, Copy, Eye, EyeOff, Radio, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createSmartQrAction, getAllSmartQrsAction, toggleSmartQrActiveAction, deleteSmartQrAction } from '@/app/actions/smart-qr';
import { ScannerFeed } from '@/components/admin/ScannerFeed';
import type { SmartQr } from '@/lib/db/schema';

// =============================================================================
// Types
// =============================================================================
type TemplateType = 'wifi' | 'party' | 'spy' | 'simrig';

interface WifiData {
  ssid: string;
  password: string;
}

interface PartyData {
  code: string;
  baseUrl: string;
}

interface SpyData {
  playerName: string;
  playerId: string;
  baseUrl: string;
}

interface SimRigData {
  challengerName: string;
  baseUrl: string;
}

// =============================================================================
// QR Design Studio - Template-Based Thermal Label Editor
// =============================================================================
export default function QRStudioPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const batchCanvasRef = useRef<HTMLDivElement>(null);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('wifi');
  
  // Form data for each template
  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '' });
  const [partyData, setPartyData] = useState<PartyData>({ code: 'PARTY2026', baseUrl: 'https://alphatraders.co.za' });
  const [spyData, setSpyData] = useState<SpyData>({ playerName: 'Agent X', playerId: '001', baseUrl: 'https://alphatraders.co.za' });
  const [simRigData, setSimRigData] = useState<SimRigData>({ challengerName: 'Uncle Mo', baseUrl: 'https://alphatraders.co.za' });

  // Batch mode
  const [batchPlayers, setBatchPlayers] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']);
  const [showBatchPreview, setShowBatchPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Smart QR state
  const [smartQrs, setSmartQrs] = useState<SmartQr[]>([]);
  const [smartQrTitle, setSmartQrTitle] = useState('');
  const [smartQrContent, setSmartQrContent] = useState('');
  const [smartQrType, setSmartQrType] = useState<'CLUE' | 'TASK' | 'INFO' | 'TRAP'>('CLUE');
  const [smartQrPoints, setSmartQrPoints] = useState(100);
  const [smartQrIsTrap, setSmartQrIsTrap] = useState(false);
  const [smartQrBonusFirstFinder, setSmartQrBonusFirstFinder] = useState(200);
  const [creatingSmartQr, setCreatingSmartQr] = useState(false);
  const [generatedSmartUrl, setGeneratedSmartUrl] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('templates');

  // Load Smart QRs on mount
  useEffect(() => {
    loadSmartQrs();
  }, []);

  const loadSmartQrs = async () => {
    const qrs = await getAllSmartQrsAction();
    setSmartQrs(qrs);
  };

  const handleCreateSmartQr = async () => {
    if (!smartQrTitle.trim() || !smartQrContent.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in title and content', variant: 'destructive' });
      return;
    }
    
    setCreatingSmartQr(true);
    try {
      const result = await createSmartQrAction({
        title: smartQrTitle,
        content: smartQrContent,
        type: smartQrType,
        points: smartQrPoints,
        isTrap: smartQrIsTrap,
        bonusFirstFinder: smartQrBonusFirstFinder,
      });
      
      if (result.success && result.shortUrl) {
        toast({ 
          title: smartQrIsTrap ? '🪤 Trap Created!' : '✨ Smart QR Created!', 
          description: `Token: ${result.qr?.token} | ${smartQrIsTrap ? '-' : '+'}${smartQrPoints} pts` 
        });
        setGeneratedSmartUrl(result.shortUrl);
        setSmartQrTitle('');
        setSmartQrContent('');
        setSmartQrPoints(100);
        setSmartQrIsTrap(false);
        setSmartQrBonusFirstFinder(200);
        loadSmartQrs();
      } else {
        toast({ title: 'Failed', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create Smart QR', variant: 'destructive' });
    } finally {
      setCreatingSmartQr(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied!', description: text });
  };

  // =============================================================================
  // Generate QR Content based on template
  // =============================================================================
  const getQRContent = (): string => {
    switch (selectedTemplate) {
      case 'wifi':
        return `WIFI:S:${wifiData.ssid};T:WPA;P:${wifiData.password};;`;
      case 'party':
        return `${partyData.baseUrl}/party/join?code=${partyData.code}`;
      case 'spy':
        return `${spyData.baseUrl}/spy/reveal/${spyData.playerId}`;
      case 'simrig':
        return `${simRigData.baseUrl}/party/leaderboard`;
      default:
        return 'https://familyverse.app';
    }
  };

  // =============================================================================
  // Native Bridge - Direct Print via Share API
  // =============================================================================
  const handlePrint = async () => {
    if (!canvasRef.current) return;

    try {
      setGenerating(true);
      toast({ title: '📸 Capturing sticker...', description: 'Please wait' });

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // High DPI
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast({ title: 'Capture failed', variant: 'destructive' });
          setGenerating(false);
          return;
        }

        const file = new File([blob], 'sticker.png', { type: 'image/png' });

        // Check if native sharing is supported (mobile)
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Print Sticker',
            });
            toast({ title: '🖨️ Sent to Share Sheet!', description: 'Tap FunPrint to print' });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Share failed', err);
              // Fallback to download
              downloadBlob(blob, 'sticker.png');
            }
          }
        } else {
          // Desktop fallback: download file
          downloadBlob(blob, 'sticker.png');
          toast({ title: '📥 Downloaded!', description: 'Open in your printer app' });
        }

        setGenerating(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Print failed:', error);
      toast({ title: 'Print failed', variant: 'destructive' });
      setGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =============================================================================
  // Batch Spy Card Factory
  // =============================================================================
  const generateBatchSpyCards = async () => {
    if (!batchCanvasRef.current) return;

    try {
      setGenerating(true);
      toast({ title: '🕵️ Generating Spy Card Strip...', description: `${batchPlayers.length} cards` });

      const canvas = await html2canvas(batchCanvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast({ title: 'Batch generation failed', variant: 'destructive' });
          setGenerating(false);
          return;
        }

        const file = new File([blob], 'spy-cards-batch.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Spy Cards Batch',
            });
            toast({ title: '🖨️ Batch Sent!', description: 'Print and cut along the lines' });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              downloadBlob(blob, 'spy-cards-batch.png');
            }
          }
        } else {
          downloadBlob(blob, 'spy-cards-batch.png');
          toast({ title: '📥 Batch Downloaded!', description: 'Print and cut along the lines' });
        }

        setGenerating(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Batch generation failed:', error);
      toast({ title: 'Batch failed', variant: 'destructive' });
      setGenerating(false);
    }
  };

  // =============================================================================
  // Template Configurations
  // =============================================================================
  const templates: { id: TemplateType; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'wifi', name: 'WiFi Login', icon: <Wifi className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'party', name: 'Party Join', icon: <Users className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { id: 'spy', name: 'Spy Role', icon: <Gamepad2 className="w-6 h-6" />, color: 'from-red-500 to-orange-500' },
    { id: 'simrig', name: 'Sim Rig', icon: <Car className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
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
            <Printer className="w-8 h-8 text-purple-400" />
            QR Design Studio
          </h1>
          <p className="text-gray-400 mt-1">58mm Thermal Label Designer • Smart Clues • Live Tracking</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="bg-black/40 border border-purple-500/30">
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
            <Printer className="w-4 h-4 mr-2" />
            Quick Templates
          </TabsTrigger>
          <TabsTrigger value="smart-clues" className="data-[state=active]:bg-purple-600">
            <Wand2 className="w-4 h-4 mr-2" />
            Smart Clues
          </TabsTrigger>
          <TabsTrigger value="live-feed" className="data-[state=active]:bg-purple-600">
            <Radio className="w-4 h-4 mr-2" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB: Quick Templates */}
        {/* ================================================================= */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Template Selector + Editor */}
            <div className="space-y-4">
              {/* Template Cards */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">⚡ Quick Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedTemplate === t.id
                            ? `bg-gradient-to-br ${t.color} border-white shadow-lg scale-105`
                            : 'bg-black/30 border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className={`${selectedTemplate === t.id ? 'text-white' : 'text-gray-400'}`}>
                          {t.icon}
                        </div>
                        <p className={`mt-2 font-semibold ${selectedTemplate === t.id ? 'text-white' : 'text-gray-300'}`}>
                          {t.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Live Editor Form */}
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Edit Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate === 'wifi' && (
                <>
                  <div>
                    <Label>WiFi Name (SSID)</Label>
                    <Input
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      placeholder="MyHomeWiFi"
                      className="bg-black/50"
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      value={wifiData.password}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-black/50"
                    />
                  </div>
                </>
              )}

              {selectedTemplate === 'party' && (
                <>
                  <div>
                    <Label>Party Code</Label>
                    <Input
                      value={partyData.code}
                      onChange={(e) => setPartyData({ ...partyData, code: e.target.value })}
                      placeholder="PARTY2026"
                      className="bg-black/50"
                    />
                  </div>
                  <div>
                    <Label>Base URL</Label>
                    <Input
                      value={partyData.baseUrl}
                      onChange={(e) => setPartyData({ ...partyData, baseUrl: e.target.value })}
                      className="bg-black/50"
                    />
                  </div>
                </>
              )}

              {selectedTemplate === 'spy' && (
                <>
                  <div>
                    <Label>Player Name</Label>
                    <Input
                      value={spyData.playerName}
                      onChange={(e) => setSpyData({ ...spyData, playerName: e.target.value })}
                      placeholder="Agent X"
                      className="bg-black/50"
                    />
                  </div>
                  <div>
                    <Label>Player ID</Label>
                    <Input
                      value={spyData.playerId}
                      onChange={(e) => setSpyData({ ...spyData, playerId: e.target.value })}
                      placeholder="001"
                      className="bg-black/50"
                    />
                  </div>
                </>
              )}

              {selectedTemplate === 'simrig' && (
                <>
                  <div>
                    <Label>Challenger Name</Label>
                    <Input
                      value={simRigData.challengerName}
                      onChange={(e) => setSimRigData({ ...simRigData, challengerName: e.target.value })}
                      placeholder="Uncle Mo"
                      className="bg-black/50"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Batch Mode (Spy Only) */}
          {selectedTemplate === 'spy' && (
            <Card className="bg-red-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Scissors className="w-5 h-5" />
                  Batch Spy Card Factory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Player Names (one per line)</Label>
                  <textarea
                    value={batchPlayers.join('\n')}
                    onChange={(e) => setBatchPlayers(e.target.value.split('\n').filter(Boolean))}
                    className="w-full h-32 bg-black/50 border border-gray-700 rounded-lg p-3 text-white text-sm"
                    placeholder="Player 1&#10;Player 2&#10;Player 3"
                  />
                </div>
                <Button
                  onClick={() => setShowBatchPreview(!showBatchPreview)}
                  variant="outline"
                  className="w-full"
                >
                  {showBatchPreview ? 'Hide' : 'Preview'} Batch ({batchPlayers.length} cards)
                </Button>
                <Button
                  onClick={generateBatchSpyCards}
                  disabled={generating || batchPlayers.length === 0}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate & Print All Cards'}
                </Button>
                <p className="text-xs text-gray-400">
                  Prints one long strip. Cut along the black lines.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* =================================================================== */}
        {/* RIGHT: Sticker Canvas Preview */}
        {/* =================================================================== */}
        <div className="space-y-4">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>📄 Sticker Preview</span>
                <span className="text-xs text-gray-400 font-normal">384px (58mm @ 203dpi)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Canvas Container with Cut Zone */}
              <div className="flex justify-center">
                <div className="border-2 border-dashed border-gray-500 p-2 bg-gray-800/50">
                  <div
                    ref={canvasRef}
                    id="sticker-canvas"
                    className="bg-white"
                    style={{ width: 384, minHeight: 300, padding: 20 }}
                  >
                    {/* Template A: WiFi */}
                    {selectedTemplate === 'wifi' && (
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <QRCodeSVG
                            value={getQRContent()}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                        <div className="text-black font-bold text-lg mb-2">📶 GET CONNECTED</div>
                        <div className="text-black text-sm">
                          <p><strong>SSID:</strong> {wifiData.ssid || 'Network Name'}</p>
                          <p><strong>Pass:</strong> {wifiData.password ? '••••••••' : 'Password'}</p>
                        </div>
                      </div>
                    )}

                    {/* Template B: Party Join */}
                    {selectedTemplate === 'party' && (
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <QRCodeSVG
                            value={getQRContent()}
                            size={250}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                        <div className="text-black font-black text-2xl tracking-wider">
                          SCAN TO ENTER
                        </div>
                        <div className="text-black text-sm mt-2">
                          Code: {partyData.code}
                        </div>
                      </div>
                    )}

                    {/* Template C: Spy Role */}
                    {selectedTemplate === 'spy' && (
                      <div className="text-center">
                        <div className="bg-black text-white font-black text-xl py-2 -mx-5 -mt-5 mb-4">
                          🔒 TOP SECRET 🔒
                        </div>
                        <div className="flex justify-center mb-4">
                          <QRCodeSVG
                            value={getQRContent()}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                        <div className="text-black font-bold text-lg">
                          PLAYER: {spyData.playerName}
                        </div>
                        <div className="text-black text-xs mt-2">
                          Scan to reveal your role
                        </div>
                      </div>
                    )}

                    {/* Template D: Sim Rig */}
                    {selectedTemplate === 'simrig' && (
                      <div className="text-center">
                        <div className="text-black font-black text-2xl mb-2">
                          🏎️ FASTEST LAP?
                        </div>
                        <div className="flex justify-center mb-4">
                          <QRCodeSVG
                            value={getQRContent()}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                        <div className="border-t-2 border-black pt-2">
                          <div className="text-black font-bold text-lg">
                            BEAT {simRigData.challengerName.toUpperCase()}
                          </div>
                          <div className="text-black text-xs">
                            Scan for Leaderboard
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Print Button - FAB Style */}
              <div className="mt-6">
                <Button
                  onClick={handlePrint}
                  disabled={generating}
                  size="lg"
                  className="w-full h-16 text-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/50"
                >
                  <Printer className="w-6 h-6 mr-3" />
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    '🖨️ SEND TO PRINTER'
                  )}
                </Button>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Mobile: Opens Share Sheet → Tap FunPrint<br />
                  Desktop: Downloads PNG file
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Sunday Party Workflow
              </h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Select template (WiFi for fridge sticker)</li>
                <li>Fill in details</li>
                <li>Tap "Send to Printer"</li>
                <li>Select FunPrint from share menu</li>
                <li>Tap Print in FunPrint app</li>
                <li>Stick it! 🎉</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =================================================================== */}
      {/* Batch Preview (Hidden by default, used for capture) */}
      {/* =================================================================== */}
      {showBatchPreview && selectedTemplate === 'spy' && (
        <Card className="bg-black/40 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white">Batch Preview (Scroll to see all)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center overflow-auto max-h-[600px]">
              <div
                ref={batchCanvasRef}
                className="bg-white"
                style={{ width: 384 }}
              >
                {batchPlayers.map((player, index) => (
                  <div key={index}>
                    {/* Card */}
                    <div className="p-5 text-center" style={{ minHeight: 280 }}>
                      <div className="bg-black text-white font-black text-xl py-2 -mx-5 mb-4">
                        🔒 TOP SECRET 🔒
                      </div>
                      <div className="flex justify-center mb-4">
                        <QRCodeSVG
                          value={`${spyData.baseUrl}/spy/reveal/${btoa(`${player}-${index}`)}`}
                          size={150}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                      <div className="text-black font-bold text-lg">
                        PLAYER: {player}
                      </div>
                      <div className="text-black text-xs mt-2">
                        Scan to reveal your role
                      </div>
                    </div>
                    {/* Cut Line (except for last card) */}
                    {index < batchPlayers.length - 1 && (
                      <div className="border-t-4 border-dashed border-black relative">
                        <span className="absolute left-2 -top-3 bg-white px-1 text-black text-xs">✂️ CUT HERE</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB: Smart Clues */}
        {/* ================================================================= */}
        <TabsContent value="smart-clues">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Create New Smart QR */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Create Smart Clue
                </CardTitle>
                <CardDescription className="text-gray-400">
                  QR codes that track scans and reveal content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <Select value={smartQrType} onValueChange={(v) => {
                    setSmartQrType(v as 'CLUE' | 'TASK' | 'INFO' | 'TRAP');
                    if (v === 'TRAP') {
                      setSmartQrIsTrap(true);
                      setSmartQrPoints(50);
                    } else {
                      setSmartQrIsTrap(false);
                    }
                  }}>
                    <SelectTrigger className="bg-black/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLUE">🔎 CLUE - Hunt Clue (+points)</SelectItem>
                      <SelectItem value="TASK">📋 TASK - Challenge (+points)</SelectItem>
                      <SelectItem value="INFO">ℹ️ INFO - General Info (no points)</SelectItem>
                      <SelectItem value="TRAP">💥 TRAP - Decoy (-points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={smartQrTitle}
                    onChange={(e) => setSmartQrTitle(e.target.value)}
                    placeholder={smartQrIsTrap ? "Free Beer (it's a trap!)" : "The Golden Ticket"}
                    className="bg-black/50 border-gray-700"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Content (revealed on scan)</Label>
                  <textarea
                    value={smartQrContent}
                    onChange={(e) => setSmartQrContent(e.target.value)}
                    placeholder={smartQrIsTrap ? "BOOM! You fell for the trap!" : "Look behind the golden frame in the lounge..."}
                    className="w-full h-24 bg-black/50 border border-gray-700 rounded-lg p-3 text-white text-sm"
                  />
                </div>

                {/* Gamification Options */}
                <div className={`p-4 rounded-lg border ${smartQrIsTrap ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30'}`}>
                  <Label className={`${smartQrIsTrap ? 'text-red-400' : 'text-green-400'} font-semibold mb-3 block`}>
                    {smartQrIsTrap ? '💥 Trap Settings' : '🎮 Reward Settings'}
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-xs">
                        {smartQrIsTrap ? 'Points Deducted' : 'Base Points'}
                      </Label>
                      <Input
                        type="number"
                        value={smartQrPoints}
                        onChange={(e) => setSmartQrPoints(parseInt(e.target.value) || 0)}
                        className="bg-black/50 border-gray-700"
                        min={0}
                      />
                    </div>
                    
                    {!smartQrIsTrap && (
                      <div>
                        <Label className="text-gray-400 text-xs">First Finder Bonus</Label>
                        <Input
                          type="number"
                          value={smartQrBonusFirstFinder}
                          onChange={(e) => setSmartQrBonusFirstFinder(parseInt(e.target.value) || 0)}
                          className="bg-black/50 border-gray-700"
                          min={0}
                        />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {smartQrIsTrap 
                      ? `Scanner loses ${smartQrPoints} points. Their phone will shake and play explosion sound!`
                      : `First scanner gets ${smartQrPoints + smartQrBonusFirstFinder} pts. Others get ${smartQrPoints} pts.`
                    }
                  </p>
                </div>

                <Button
                  onClick={handleCreateSmartQr}
                  disabled={creatingSmartQr}
                  className={`w-full ${smartQrIsTrap 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {creatingSmartQr ? 'Creating...' : smartQrIsTrap ? '🪤 Create Trap' : '✨ Generate Smart QR'}
                </Button>

                {generatedSmartUrl && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 space-y-3">
                    <p className="text-green-400 text-sm font-medium">✨ QR Created!</p>
                    <div className="flex justify-center bg-white p-4 rounded-lg">
                      <QRCodeSVG value={generatedSmartUrl} size={150} level="H" />
                    </div>
                    <div className="flex gap-2">
                      <Input value={generatedSmartUrl} readOnly className="bg-black/50 text-xs" />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedSmartUrl)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Existing Smart QRs */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>📋 Your Smart QRs</span>
                  <Button size="sm" variant="ghost" onClick={loadSmartQrs}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {smartQrs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No Smart QRs yet. Create one!</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {smartQrs.map((qr) => (
                      <div
                        key={qr.id}
                        className={`p-4 rounded-lg border ${
                          qr.isActive 
                            ? 'bg-purple-900/20 border-purple-500/30' 
                            : 'bg-gray-900/20 border-gray-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={qr.type === 'CLUE' ? 'default' : qr.type === 'TASK' ? 'secondary' : 'outline'}>
                                {qr.type}
                              </Badge>
                              <span className="font-mono text-purple-400 text-sm">{qr.token}</span>
                            </div>
                            <p className="text-white font-medium mt-1">{qr.title}</p>
                            <p className="text-gray-400 text-sm truncate">{qr.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>👁️ {qr.scanCount} scans</span>
                              {qr.lastScannedAt && (
                                <span>Last: {new Date(qr.lastScannedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${window.location.origin}/q/${qr.token}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await toggleSmartQrActiveAction(qr.id);
                                loadSmartQrs();
                              }}
                            >
                              {qr.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={async () => {
                                if (confirm('Delete this Smart QR?')) {
                                  await deleteSmartQrAction(qr.id);
                                  loadSmartQrs();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB: Live Feed */}
        {/* ================================================================= */}
        <TabsContent value="live-feed">
          <ScannerFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
