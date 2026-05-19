import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Red glow behind headline */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '100px',
          background: 'radial-gradient(ellipse, rgba(226,75,74,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Headline */}
        <div style={{
          fontSize: '72px',
          fontWeight: '800',
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span>First the AI <span style={{ color: '#E24B4A' }}>roasts</span> you.</span>
          <span style={{ color: '#E24B4A' }}>Then the internet does.</span>
        </div>

        {/* Subline */}
        <div style={{
          fontSize: '24px',
          color: '#666',
          fontFamily: 'monospace',
          marginBottom: '48px',
          display: 'flex',
        }}>
          Paste URL. Get roasted. Share on X. Go viral.
        </div>

        {/* Example roast card */}
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #E24B4A',
          borderRadius: '12px',
          padding: '20px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ color: '#E24B4A', fontSize: '48px', fontWeight: '800', display: 'flex' }}>
            23/100
          </div>
          <div style={{ color: '#888', fontSize: '16px', fontFamily: 'monospace', display: 'flex' }}>
            &quot;not even my dog would click this CTA&quot;
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: '20px',
          color: '#333',
          fontFamily: 'monospace',
          display: 'flex',
        }}>
          getroasted.wtf
        </div>
      </div>
    ),
    { ...size }
  );
}
