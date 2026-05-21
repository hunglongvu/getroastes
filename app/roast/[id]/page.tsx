import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRoast, getRecentRoasts } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import RoastResult from '@/app/components/RoastResult';

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

        {/* Animated two-column layout */}
        <RoastResult roast={roast} rank={rank} total={total ?? 0} />

        {/* Recent roasts feed */}
        <div style={{ marginTop: 96 }}>
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
            <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', color: '#888' }}>
              RECENT ROASTS
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>
              last 8
            </span>
          </div>

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

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#f5f5f5' }}>
                        {r.domain}
                      </span>
                      {isCurrent && (
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#ff8c00' }}>
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

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link
              href="/"
              style={{ fontFamily: 'monospace', fontSize: 12, color: '#ff8c00', textDecoration: 'none' }}
            >
              roast another →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
