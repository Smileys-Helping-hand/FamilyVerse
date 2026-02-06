'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
import { Printer, QrCode } from 'lucide-react';
import { getPartyTasksAction } from '@/app/actions/party-logic';

type TargetType = 'party-join' | 'sim-racing' | 'task' | 'custom';

interface Task {
  id: string;
  title: string;
  description: string;
}

export default function ThermalPrinterPage() {
  const [targetType, setTargetType] = useState<TargetType>('party-join');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [helperText, setHelperText] = useState('SCAN TO JOIN');
  const [batchMode, setBatchMode] = useState(false);

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

  useEffect(() => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    let value = '';
    let text = '';

    switch (targetType) {
      case 'party-join':
        value = `${baseURL}/party/join`;
        text = 'SCAN TO JOIN';
        break;
      case 'sim-racing':
        value = `${baseURL}/party/dashboard?tab=sim-racing`;
        text = 'SCAN TO RACE';
        break;
      case 'task':
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          value = `${baseURL}/game/task/${selectedTaskId}`;
          text = task ? task.title.toUpperCase() : 'SCAN FOR TASK';
        }
        break;
    }

    setQrValue(value);
    setHelperText(text);
  }, [targetType, selectedTaskId, tasks]);

  const handlePrint = () => {
    window.print();
  };

  const handleBatchPrint = () => {
    setBatchMode(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <>
      {/* Screen UI */}
      <div className="no-print min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-6 h-6" />
              58mm Thermal Printer Studio
            </CardTitle>
            <CardDescription>
              Generate QR codes optimized for mini thermal printers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Target Link</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v as TargetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="party-join">Join Party</SelectItem>
                  <SelectItem value="sim-racing">Sim Racing</SelectItem>
                  <SelectItem value="task">Specific Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === 'task' && (
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

            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1" disabled={!qrValue}>
                <Printer className="w-4 h-4 mr-2" />
                Print Single
              </Button>
              <Button
                onClick={handleBatchPrint}
                variant="secondary"
                className="flex-1"
                disabled={tasks.length === 0}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Print All Tasks
              </Button>
            </div>

            {/* Preview */}
            {qrValue && (
              <div className="border rounded-lg p-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="flex flex-col items-center">
                  <p className="font-bold text-lg mb-2">{helperText}</p>
                  <QRCodeSVG value={qrValue} size={150} level="H" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Content */}
      {!batchMode && qrValue && (
        <div id="thermal-sticker" className="print-only">
          <div className="sticker-text-top">{helperText}</div>
          <div className="sticker-qr">
            <QRCodeSVG value={qrValue} size={160} level="H" includeMargin={false} />
          </div>
          <div className="sticker-text-bottom">
            {qrValue.length > 40 ? '🔥 Scan Now!' : qrValue}
          </div>
        </div>
      )}

      {/* Batch Print Content */}
      {batchMode && tasks.length > 0 && (
        <div id="thermal-batch" className="print-only">
          {tasks.map((task, index) => {
            const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
            const taskUrl = `${baseURL}/game/task/${task.id}`;
            return (
              <div key={task.id} className="thermal-sticker-item" style={{ pageBreakAfter: index < tasks.length - 1 ? 'always' : 'auto' }}>
                <div className="sticker-text-top">{task.title.toUpperCase()}</div>
                <div className="sticker-qr">
                  <QRCodeSVG value={taskUrl} size={160} level="H" includeMargin={false} />
                </div>
                <div className="sticker-text-bottom">Task #{index + 1}</div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @media screen {
          .print-only {
            display: none !important;
          }
          .no-print {
            display: block;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          
          .no-print {
            display: none !important;
          }

          #thermal-sticker,
          #thermal-sticker *,
          #thermal-batch,
          #thermal-batch * {
            visibility: visible;
          }

          #thermal-sticker,
          .thermal-sticker-item {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            font-family: 'Arial', sans-serif;
            padding: 3mm 2mm;
            background: white;
          }

          #thermal-batch {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
          }

          .sticker-text-top {
            font-weight: 900;
            font-size: 14pt;
            text-transform: uppercase;
            margin-bottom: 3mm;
            color: #000;
            letter-spacing: 0.5px;
          }

          .sticker-qr {
            margin: 2mm 0;
          }

          .sticker-text-bottom {
            font-weight: 600;
            font-size: 9pt;
            margin-top: 3mm;
            color: #333;
          }

          @page {
            margin: 0;
            size: 58mm auto;
          }
        }
      `}</style>
    </>
  );
}
