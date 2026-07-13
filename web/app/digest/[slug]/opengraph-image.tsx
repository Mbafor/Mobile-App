import { ImageResponse } from 'next/og';

export const alt = 'Voila Weekly Digest';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B6623',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>Voila Africa</div>
        <div style={{ fontSize: 40, marginTop: 24 }}>Weekly Opportunities Digest</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.8 }}>{slug}</div>
      </div>
    ),
    { ...size },
  );
}
