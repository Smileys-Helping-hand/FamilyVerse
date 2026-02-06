'use client';

import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

interface LabelData {
  value: string;
  text: string;
}

export default function PrintBatchPage() {
  const searchParams = useSearchParams();
  const width = Number(searchParams.get('width')) || 50;
  const height = Number(searchParams.get('height')) || 30;
  const dataParam = searchParams.get('data');
  
  let labels: LabelData[] = [];
  try {
    labels = dataParam ? JSON.parse(dataParam) : [];
  } catch (error) {
    console.error('Failed to parse label data:', error);
  }

  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container">
      <div id="printable-batch">
        {labels.map((label, index) => (
          <div
            key={index}
            className="label"
            style={{
              width: `${width}mm`,
              height: `${height}mm`,
            }}
          >
            {label.text && (
              <div className="label-text">
                {label.text}
              </div>
            )}
            <div className="label-qr">
              <QRCodeSVG
                value={label.value}
                size={Math.min(width * 2.5, 180)}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .print-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
          padding: 10mm;
        }

        .label {
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2mm;
          border: 1px dashed #ccc;
          margin-bottom: 5mm;
          page-break-after: always;
        }

        .label:last-child {
          page-break-after: auto;
          margin-bottom: 0;
        }

        .label-text {
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 9pt;
          text-align: center;
          margin-bottom: 2mm;
          color: black;
          max-width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .label-qr {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          #printable-batch,
          #printable-batch * {
            visibility: visible;
          }

          #printable-batch {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .print-container {
            background: white;
            padding: 0;
          }

          .label {
            border: none;
            margin-bottom: 0;
            page-break-after: always;
            background: white;
          }

          .label:last-child {
            page-break-after: auto;
          }

          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
}
