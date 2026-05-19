import Link from 'next/link';

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/" className="font-mono text-sm text-zinc-500 hover:text-white transition-colors">
          ← getroasted.wtf
        </Link>

        <h1 className="font-mono font-bold text-2xl mt-10 mb-1" style={{ color: '#E24B4A' }}>
          Imprint
        </h1>
        <p className="font-mono text-xs text-zinc-600 mb-10">// Legal disclosure pursuant to § 5 TMG</p>

        <div className="font-mono text-sm text-zinc-400" style={{ lineHeight: 1.9 }}>
          <p>Hung Long Vu</p>
          <p className="text-zinc-600 text-xs mt-1 mb-6">
            {/* Add your address here */}
            [Street and house number]<br />
            [Postal code, City]<br />
            Germany
          </p>

          <p>
            Email:{' '}
            <a href="mailto:hello@getroasted.wtf" className="text-zinc-300 hover:text-white transition-colors">
              hello@getroasted.wtf
            </a>
          </p>
        </div>

        <p className="font-mono text-xs text-zinc-700 mt-12">
          // Responsible for content pursuant to § 55 para. 2 RStV: Hung Long Vu
        </p>
      </div>
    </main>
  );
}
