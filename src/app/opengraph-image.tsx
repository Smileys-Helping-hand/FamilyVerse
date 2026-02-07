import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Mohammed's 26th Birthday Party";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Cake emoji */}
        <div style={{ fontSize: 120, marginBottom: 20 }}>🎂</div>

        {/* Main title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 10,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Mohammed&apos;s 26th
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: '#fbbf24',
            marginBottom: 40,
          }}
        >
          BIRTHDAY PARTY
        </div>

        {/* Features */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.9)',
            display: 'flex',
            gap: 30,
          }}
        >
          <span>🏎️ Sim Racing</span>
          <span>•</span>
          <span>🕵️ Spy Game</span>
          <span>•</span>
          <span>💰 Betting</span>
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 30,
          }}
        >
          Scan QR or tap to join the party!
        </div>

        {/* Party OS branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            background: 'rgba(255,255,255,0.15)',
            padding: '10px 40px',
            borderRadius: 20,
            fontSize: 20,
            color: 'white',
            fontWeight: 600,
          }}
        >
          PARTY OS
        </div>
      </div>
    ),
    { ...size }
  );
}
