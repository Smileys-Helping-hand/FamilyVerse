'use client';

import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

export default function PrintLabelPage() {
  const searchParams = useSearchParams();
  const value = searchParams.get('value') || '';
  const text = searchParams.get('text') || '';
  const width = Number(searchParams.get('width')) || 50;
  const height = Number(searchParams.get('height')) || 30;

  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container">
      <div
        id="printable-label"
        className="label"
        style={{
          width: `${width}mm`,
          height: `${height}mm`,
        }}
      >
        {text && (
          <div className="label-text">
            {text}
          </div>
        )}
        <div className="label-qr">
          <QRCodeSVG
            value={value}
            size={Math.min(width * 2.5, 180)}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      <style jsx>{`
        .print-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f0f0;
        }

        .label {
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2mm;
          border: 1px dashed #ccc;
        }

        .label-text {
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 10pt;
          text-align: center;
          margin-bottom: 2mm;
          color: black;
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

          #printable-label,
          #printable-label * {
            visibility: visible;
          }

          #printable-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            border: none;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .print-container {
            background: white;
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
