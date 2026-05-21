import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoast } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { ShareButton } from '@/app/components/ShareButton';

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roast = await getRoast(id);
  if (!roast) notFound();

  const [{ count: lessCooked }, { count: total }] = await Promise.all([
    supabase.from('roasts').select('*', { count: 'exact', head: true }).lt('score', roast.score),
    supabase.from('roasts').select('*', { count: 'exact', head: true }),
  ]);

  const rank = (total ?? 0) - (lessCooked ?? 0);

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back link */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/"
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }}
          >
            ← getroasted.wtf
          </Link>
        </div>

        {/* Two-column layout — card first on mobile via order */}
        <div
          className="flex flex-col md:flex-row"
          style={{ gap: 48, alignItems: 'flex-start' }}
        >

          {/* LEFT — content (below card on mobile, left on desktop) */}
          <div
            className="order-2 md:order-1"
            style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}
          >
            {/* Domain */}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              {roast.domain}
            </p>

            {/* Score row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 20,
                flexWrap: 'wrap',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: '#ff8c00',
                  lineHeight: 1,
                  letterSpacing: -2,
                  textShadow: '0 0 40px rgba(255,140,0,0.5)',
                }}
              >
                {roast.score}%
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#ff8c00',
                  letterSpacing: 4,
                  textShadow: '0 0 20px rgba(255,140,0,0.4)',
                }}
              >
                COOKED
              </span>
            </div>

            {/* Orange divider */}
            <div
              style={{
                width: '100%',
                height: 1,
                background: 'rgba(255,140,0,0.35)',
                marginBottom: 28,
              }}
            />

            {/* Quote */}
            <p
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.5,
                marginBottom: 32,
              }}
            >
              &ldquo;{roast.roast}&rdquo;
            </p>

            {/* Hall of Shame rank */}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: '#ff8c00',
                marginBottom: 40,
              }}
            >
              🏆 #{rank} on Hall of Shame
              {total ? (
                <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  out of {total.toLocaleString()} roasted
                </span>
              ) : null}
            </p>

            {/* Share button */}
            <div style={{ marginBottom: 12 }}>
              <ShareButton data={roast} />
            </div>

            {/* Hint */}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
                textAlign: 'center',
              }}
            >
              // don&apos;t forget to attach the image
            </p>
          </div>

          {/* RIGHT — card image (first on mobile, sticky on desktop) */}
          <div
            className="order-1 md:order-2"
            style={{ flex: '1 1 0', minWidth: 0 }}
          >
            <div className="md:sticky" style={{ top: 24 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/card-image/${roast.id}`}
                alt={`roast card for ${roast.domain}`}
                style={{ width: '100%', borderRadius: 12, display: 'block' }}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
