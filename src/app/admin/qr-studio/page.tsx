'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Printer,
  QrCode,
  Wifi,
  CheckCircle2,
  Users,
  Car,
  Download,
  Copy,
  ExternalLink,
  Settings,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPartyTasksAction } from '@/app/actions/party-logic';

type QRType = 'party-join' | 'task-completion' | 'sim-rig' | 'wifi' | 'custom';

interface LabelSettings {
  paperWidth: number;
  paperHeight: number | 'continuous';
  includeHelperText: boolean;
  helperText: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
}

export default function QRStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [qrType, setQrType] = useState<QRType>('party-join');
  const [qrValue, setQrValue] = useState('');
  const [previewValue, setPreviewValue] = useState('');
  
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    paperWidth: 50,
    paperHeight: 30,
    includeHelperText: true,
    helperText: 'Scan Me!',
  });
  
  // Type-specific inputs
  const [partyCode, setPartyCode] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [customURL, setCustomURL] = useState('');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const result = await getPartyTasksAction();
      if (result.success && result.tasks) {
        setTasks(result.tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
        })));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  // Generate QR value based on type
  useEffect(() => {
    let value = '';
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';

    switch (qrType) {
      case 'party-join':
        if (partyCode) {
          value = `${baseURL}/party/join?code=${partyCode}`;
        }
        break;
      case 'task-completion':
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          value = `${baseURL}/api/tasks/complete?taskId=${selectedTaskId}`;
          if (task && labelSettings.includeHelperText) {
            setLabelSettings(prev => ({
              ...prev,
              helperText: `Complete: ${task.title}`,
            }));
          }
        }
        break;
      case 'sim-rig':
        value = `${baseURL}/party/sim-racing`;
        break;
      case 'wifi':
        if (wifiSSID) {
          // Standard WiFi QR format: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;;
          value = `WIFI:S:${wifiSSID};T:${wifiSecurity};P:${wifiPassword};;`;
        }
        break;
      case 'custom':
        value = customURL;
        break;
    }

    setQrValue(value);
    setPreviewValue(value);
  }, [qrType, partyCode, selectedTaskId, wifiSSID, wifiPassword, wifiSecurity, customURL, tasks]);

  const openPrintWindow = () => {
    if (!qrValue) {
      toast({
        title: '❌ No QR Code',
        description: 'Generate a QR code first',
        variant: 'destructive',
      });
      return;
    }

    const printURL = `/admin/print-label?` + new URLSearchParams({
      value: qrValue,
      text: labelSettings.includeHelperText ? labelSettings.helperText : '',
      width: labelSettings.paperWidth.toString(),
      height: labelSettings.paperHeight === 'continuous' ? '30' : labelSettings.paperHeight.toString(),
    }).toString();

    window.open(printURL, '_blank', 'width=800,height=600');
  };

  const openBatchPrint = () => {
    if (tasks.length === 0) {
      toast({
        title: '❌ No Tasks',
        description: 'No tasks available to print',
        variant: 'destructive',
      });
      return;
    }

    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const taskData = tasks.map(task => ({
      value: `${baseURL}/api/tasks/complete?taskId=${task.id}`,
      text: `Task: ${task.title}`,
    }));

    const printURL = `/admin/print-batch?` + new URLSearchParams({
      width: labelSettings.paperWidth.toString(),
      height: labelSettings.paperHeight === 'continuous' ? '30' : labelSettings.paperHeight.toString(),
      data: JSON.stringify(taskData),
    }).toString();

    window.open(printURL, '_blank', 'width=800,height=600');
  };

  const copyToClipboard = () => {
    if (qrValue) {
      navigator.clipboard.writeText(qrValue);
      toast({
        title: '📋 Copied!',
        description: 'QR value copied to clipboard',
      });
    }
  };

  const downloadQR = () => {
    // Get the SVG element
    const svg = document.querySelector('#preview-qr svg');
    if (!svg) return;

    // Convert to data URL and download
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `qr-${qrType}-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({
      title: '💾 Downloaded!',
      description: 'QR code saved as SVG',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <QrCode className="w-10 h-10 text-purple-400" />
              QR Studio & Label Engine
            </h1>
            <p className="text-slate-400 mt-2">
              Generate, preview, and print QR codes for your thermal label printer
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/control')}
            className="border-slate-600 text-slate-300"
          >
            Back to Control
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration & Generator */}
          <div className="space-y-6">
            {/* Label Settings */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Label Settings
                </CardTitle>
                <CardDescription>Configure your thermal printer paper</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Paper Width (mm)</Label>
                    <Input
                      type="number"
                      value={labelSettings.paperWidth}
                      onChange={(e) => setLabelSettings(prev => ({
                        ...prev,
                        paperWidth: Number(e.target.value),
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Paper Height (mm)</Label>
                    <Input
                      type="number"
                      value={labelSettings.paperHeight === 'continuous' ? 30 : labelSettings.paperHeight}
                      onChange={(e) => setLabelSettings(prev => ({
                        ...prev,
                        paperHeight: Number(e.target.value),
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Include Helper Text</Label>
                  <Switch
                    checked={labelSettings.includeHelperText}
                    onCheckedChange={(checked) => setLabelSettings(prev => ({
                      ...prev,
                      includeHelperText: checked,
                    }))}
                  />
                </div>

                {labelSettings.includeHelperText && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Helper Text</Label>
                    <Input
                      value={labelSettings.helperText}
                      onChange={(e) => setLabelSettings(prev => ({
                        ...prev,
                        helperText: e.target.value,
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Scan me!"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Generator */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  QR Generator
                </CardTitle>
                <CardDescription>Choose what to encode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selector */}
                <div className="space-y-2">
                  <Label className="text-slate-300">QR Type</Label>
                  <Select value={qrType} onValueChange={(value) => setQrType(value as QRType)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="party-join">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Party Join
                        </div>
                      </SelectItem>
                      <SelectItem value="task-completion">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Task Completion
                        </div>
                      </SelectItem>
                      <SelectItem value="sim-rig">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Sim Rig Check-in
                        </div>
                      </SelectItem>
                      <SelectItem value="wifi">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4" />
                          Wi-Fi Login
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Custom URL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700" />

                {/* Type-specific inputs */}
                {qrType === 'party-join' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Party Code</Label>
                    <Input
                      value={partyCode}
                      onChange={(e) => setPartyCode(e.target.value)}
                      placeholder="PARTY123"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Guests scan this to join your party
                    </p>
                  </div>
                )}

                {qrType === 'task-completion' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Select Task</Label>
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">
                      Scanning completes the task
                    </p>
                  </div>
                )}

                {qrType === 'sim-rig' && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/50 p-4">
                    <p className="text-blue-300 text-sm">
                      <Car className="w-4 h-4 inline mr-2" />
                      Generates a link to the sim racing lap time submission page
                    </p>
                  </div>
                )}

                {qrType === 'wifi' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Network Name (SSID)</Label>
                      <Input
                        value={wifiSSID}
                        onChange={(e) => setWifiSSID(e.target.value)}
                        placeholder="MyHomeWiFi"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Security Type</Label>
                      <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">No Password</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-slate-400">
                      <Wifi className="w-4 h-4 inline mr-2" />
                      Guests can scan to auto-connect to WiFi
                    </p>
                  </div>
                )}

                {qrType === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Custom URL</Label>
                    <Input
                      value={customURL}
                      onChange={(e) => setCustomURL(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Any URL or text content
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Batch Actions */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Layers className="w-5 h-5 text-orange-400" />
                  Batch Generator
                </CardTitle>
                <CardDescription>Print multiple labels at once</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={openBatchPrint}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={tasks.length === 0}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print All Task QRs ({tasks.length})
                </Button>
                <p className="text-xs text-slate-400 mt-2">
                  Generates a continuous strip of all task completion QR codes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Print */}
          <div className="space-y-6">
            {/* Label Preview */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <QrCode className="w-5 h-5 text-green-400" />
                  Label Preview
                </CardTitle>
                <CardDescription>
                  Physical size: {labelSettings.paperWidth}mm × {labelSettings.paperHeight === 'continuous' ? '30' : labelSettings.paperHeight}mm
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preview Container */}
                <div className="flex justify-center items-center p-8 bg-slate-900 rounded-lg">
                  <div
                    id="preview-qr"
                    className="bg-white p-4 rounded-lg shadow-2xl flex flex-col items-center justify-center"
                    style={{
                      width: `${labelSettings.paperWidth * 2}px`,
                      minHeight: `${(labelSettings.paperHeight === 'continuous' ? 30 : labelSettings.paperHeight) * 2}px`,
                    }}
                  >
                    {previewValue ? (
                      <>
                        {labelSettings.includeHelperText && (
                          <p className="text-black text-center font-bold text-sm mb-2">
                            {labelSettings.helperText}
                          </p>
                        )}
                        <QRCodeSVG
                          value={previewValue}
                          size={Math.min(labelSettings.paperWidth * 1.5, 200)}
                          level="H"
                          includeMargin={true}
                        />
                      </>
                    ) : (
                      <div className="text-gray-400 text-center">
                        <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Configure settings to generate QR</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Value Display */}
                {previewValue && (
                  <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Encoded Value:</p>
                    <p className="text-sm text-slate-300 break-all font-mono">
                      {previewValue}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Print & Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={openPrintWindow}
                  disabled={!qrValue}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  size="lg"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print Now
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={copyToClipboard}
                    disabled={!qrValue}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={downloadQR}
                    disabled={!qrValue}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download SVG
                  </Button>
                </div>

                {/* Print Tips */}
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Thermal Printer Tips
                  </h4>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Select your mini printer as destination</li>
                    <li>• Set margins to "None" in print settings</li>
                    <li>• Adjust scale to 90-100% if needed</li>
                    <li>• Use "Portrait" orientation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
