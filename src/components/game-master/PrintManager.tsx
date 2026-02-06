'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllScannables } from '@/app/actions/scannables';
import type { Scannable } from '@/lib/db/schema';
import { Printer, Download } from 'lucide-react';
import Image from 'next/image';

interface PrintManagerProps {
  eventId: number;
}

export default function PrintManager({ eventId }: PrintManagerProps) {
  const [scannables, setScannables] = useState<Scannable[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'a4' | 'label'>('a4');

  useEffect(() => {
    loadAllScannables();
  }, []);

  const loadAllScannables = async () => {
    setLoading(true);
    const result = await getAllScannables(eventId);
    if (result.success) {
      // Only show active scannables
      setScannables(result.scannables.filter((s) => s.isActive));
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadAll = () => {
    scannables.forEach((scannable, index) => {
      setTimeout(() => {
        if (scannable.qrCodeData) {
          const link = document.createElement('a');
          link.href = scannable.qrCodeData;
          link.download = `${scannable.label.replace(/\s+/g, '-')}.png`;
          link.click();
        }
      }, index * 200);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Loading scannables...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Print Controls (hide in print mode) */}
      <div className="no-print mb-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Print Manager</CardTitle>
            <CardDescription>
              Print all active QR codes for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={layout} onValueChange={(v) => setLayout(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="a4">A4 Sheet (3x4 Grid)</TabsTrigger>
                <TabsTrigger value="label">Label Printer (62mm)</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print Sheet
              </Button>
              <Button onClick={downloadAll} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                💡 Printing Tips:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A4 Layout: Perfect for cutting into individual cards</li>
                <li>• Label Layout: Optimized for 62mm label printers (Brother P-Touch, Dymo)</li>
                <li>• Make sure to enable &quot;Background Graphics&quot; in print settings</li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>{scannables.length}</strong> active scannables ready to print
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Layout */}
      <div className={`print-only ${layout === 'a4' ? 'grid-layout' : 'label-layout'}`}>
        {scannables.map((scannable) => (
          <div key={scannable.id} className="scannable-card">
            <div className="scannable-header">
              <h3 className="scannable-title">{scannable.label}</h3>
              <Badge 
                variant={
                  scannable.type === 'TASK' ? 'default' : 
                  scannable.type === 'TREASURE_NODE' ? 'secondary' : 
                  'destructive'
                }
                className="scannable-badge"
              >
                {scannable.type === 'TASK' ? 'Task' : 
                 scannable.type === 'TREASURE_NODE' ? 'Hunt' : 
                 'Evidence'}
              </Badge>
            </div>
            
            {scannable.qrCodeData && (
              <div className="scannable-qr">
                <Image 
                  src={scannable.qrCodeData} 
                  alt={`QR Code for ${scannable.label}`}
                  width={200}
                  height={200}
                  unoptimized
                />
              </div>
            )}

            {layout === 'a4' && scannable.chainId && (
              <div className="scannable-footer">
                Step {scannable.chainOrder}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          body {
            margin: 0;
            padding: 0;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }

        /* A4 Grid Layout */
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12mm;
          padding: 10mm;
          page-break-after: always;
        }

        /* Label Layout (62mm width) */
        .label-layout {
          display: flex;
          flex-direction: column;
          gap: 5mm;
          width: 62mm;
        }

        .label-layout .scannable-card {
          page-break-inside: avoid;
          page-break-after: always;
        }

        /* Scannable Card Styles */
        .scannable-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 8mm;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          page-break-inside: avoid;
        }

        .scannable-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4mm;
          margin-bottom: 4mm;
          width: 100%;
        }

        .scannable-title {
          font-size: 14pt;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .scannable-badge {
          font-size: 10pt;
          padding: 2mm 4mm;
          border-radius: 4px;
        }

        .scannable-qr {
          margin: 4mm 0;
        }

        .scannable-qr img {
          width: 40mm !important;
          height: 40mm !important;
          image-rendering: crisp-edges;
        }

        .label-layout .scannable-qr img {
          width: 50mm !important;
          height: 50mm !important;
        }

        .scannable-footer {
          font-size: 10pt;
          color: #6b7280;
          margin-top: 2mm;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @page :first {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
