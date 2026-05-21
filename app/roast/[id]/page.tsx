import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoast, getRecentRoasts } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { ShareButton } from '@/app/components/ShareButton';

function timeAgo(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function RoastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [roast, recent] = await Promise.all([
    getRoast(id),
    getRecentRoasts(8),
  ]);
  if (!roast) notFound();

  const [{ count: lessCooked }, { count: total }] = await Promise.all([
    supabase.from('roasts').select('*', { count: 'exact', head: true }).lt('score', roast.score),
    supabase.from('roasts').select('*', { count: 'exact', head: true }),
  ]);

  const rank = (total ?? 0) - (lessCooked ?? 0);

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' }}>

        {/* Back link */}
        <div style={{ marginBottom: 48 }}>
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

        {/* Two-column layout */}
        <div
          className="flex flex-col md:flex-row"
          style={{ gap: 48, alignItems: 'flex-start' }}
        >
          {/* LEFT — content */}
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

            {/* Roast text — no wrapping quotes, model includes own formatting */}
            <p
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.5,
                marginBottom: 32,
              }}
            >
              {roast.roast}
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
                marginBottom: 20,
              }}
            >
              // don&apos;t forget to attach the image
            </p>

            {/* Rank — below share button, small and quiet */}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#666',
              }}
            >
              🏆 #{rank} of {total?.toLocaleString() ?? '?'} roasted
            </p>
          </div>

          {/* RIGHT — card image */}
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

        {/* Recent roasts feed */}
        <div style={{ marginTop: 96 }}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #1a1a1a',
              paddingTop: 16,
              marginBottom: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.2em',
                color: '#888',
              }}
            >
              RECENT ROASTS
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#444',
              }}
            >
              last 8
            </span>
          </div>

          {/* Feed rows */}
          <div>
            {recent.map((r) => {
              const isCurrent = r.id === id;
              const excerpt = r.roast.length > 80 ? r.roast.slice(0, 80).replace(/\s\S*$/, '') + '…' : r.roast;
              return (
                <Link
                  key={r.id}
                  href={`/roast/${r.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px 12px',
                    borderBottom: '1px solid #1a1a1a',
                    textDecoration: 'none',
                    background: isCurrent ? 'rgba(255,140,0,0.04)' : 'transparent',
                  }}
                >
                  {/* Score */}
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#ff8c00',
                      minWidth: 56,
                      lineHeight: 1.2,
                      flexShrink: 0,
                    }}
                  >
                    {r.score}%
                  </span>

                  {/* Domain + excerpt */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: '#f5f5f5',
                        }}
                      >
                        {r.domain}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 10,
                            color: '#ff8c00',
                          }}
                        >
                          ← you
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: '#888',
                        lineHeight: 1.4,
                        display: 'block',
                      }}
                    >
                      {excerpt}
                    </span>
                  </div>

                  {/* Time ago */}
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      color: '#444',
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                  >
                    {timeAgo(r.createdAt)}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Roast another */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#ff8c00',
                textDecoration: 'none',
              }}
            >
              roast another →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
