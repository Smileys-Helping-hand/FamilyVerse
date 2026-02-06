'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, QrCode, Share2, Download } from 'lucide-react';
import { getPartyTasksAction } from '@/app/actions/party-logic';
import { useToast } from '@/hooks/use-toast';

type StickerTarget = 'party-join' | 'sim-rig' | 'task';

interface Task {
  id: string;
  title: string;
  description: string;
}

export default function StickerFactoryPage() {
  const [target, setTarget] = useState<StickerTarget>('party-join');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [qrValue, setQrValue] = useState('');
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load tasks
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

  // Generate QR value and instruction
  useEffect(() => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    let url = '';
    let text = '';

    switch (target) {
      case 'party-join':
        url = `${baseURL}/party/join`;
        text = 'SCAN TO JOIN';
        break;
      case 'sim-rig':
        url = `${baseURL}/party/dashboard?tab=sim-racing`;
        text = 'SCAN TO RACE';
        break;
      case 'task':
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          url = `${baseURL}/game/task/${selectedTaskId}`;
          text = task ? task.title.toUpperCase() : 'SCAN FOR TASK';
        }
        break;
    }

    setQrValue(url);
    setInstruction(text);
  }, [target, selectedTaskId, tasks]);

  const generateAndShare = async () => {
    if (!stickerRef.current || !qrValue) {
      toast({
        title: '❌ Error',
        description: 'No sticker to share',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Generate canvas with high quality
      const canvas = await html2canvas(stickerRef.current, {
        scale: 3, // High DPI for printing
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      // Create file
      const file = new File([blob], 'familyverse-sticker.png', { type: 'image/png' });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'FamilyVerse Sticker',
          text: instruction,
          files: [file],
        });
        
        toast({
          title: '🖨️ Shared!',
          description: 'Select your printer app to print',
        });
      } else {
        // Fallback: Download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'familyverse-sticker.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: '⬇️ Downloaded',
          description: 'Open the image in your printer app',
        });
      }
    } catch (error: any) {
      console.error('Share failed:', error);
      toast({
        title: '❌ Share Failed',
        description: error.message || 'Could not share sticker',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-6 h-6" />
              Sticker Factory 🏭
            </CardTitle>
            <CardDescription>
              Generate black & white stickers for your 58mm thermal printer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Selection */}
            <div>
              <Label>Sticker Target</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as StickerTarget)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="party-join">
                    <span className="flex items-center gap-2">
                      🎉 Join Party
                    </span>
                  </SelectItem>
                  <SelectItem value="sim-rig">
                    <span className="flex items-center gap-2">
                      🏎️ Sim Racing Rig
                    </span>
                  </SelectItem>
                  <SelectItem value="task">
                    <span className="flex items-center gap-2">
                      ✅ Specific Task
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task Selection (if target is task) */}
            {target === 'task' && (
              <div>
                <Label>Select Task</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={generateAndShare}
              disabled={loading || !qrValue}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Printer
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              💡 Tap to open share sheet, then select your printer app
            </p>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {qrValue && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                {/* The Actual Sticker (384px wide for 58mm @ 203dpi) */}
                <div
                  ref={stickerRef}
                  className="relative"
                  style={{
                    width: '384px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: '4px dashed #000000',
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: '16px',
                      letterSpacing: '2px',
                    }}
                  >
                    FAMILYVERSE
                  </div>

                  {/* QR Code */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <QRCodeSVG
                      value={qrValue}
                      size={200}
                      level="H"
                      includeMargin={false}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  {/* Instruction Footer */}
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {instruction}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              How to Print
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>On Mobile:</strong></p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Tap "Share to Printer" above</li>
              <li>Select your Printer App from the share sheet</li>
              <li>The sticker will load in your printer app</li>
              <li>Print! 🖨️</li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              💡 <strong>Tip:</strong> The dashed border shows where to cut. Sticker is optimized for 58mm thermal printers at 203 DPI.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
