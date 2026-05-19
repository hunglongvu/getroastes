import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/" className="font-mono text-sm text-zinc-500 hover:text-white transition-colors">
          ← getroasted.wtf
        </Link>

        <h1 className="font-mono font-bold text-2xl mt-10 mb-8" style={{ color: '#E24B4A' }}>
          Impressum
        </h1>

        <div className="font-mono text-sm text-zinc-400 space-y-2" style={{ lineHeight: 1.8 }}>
          <p className="text-zinc-600 text-xs mb-6">// Angaben gemäß § 5 TMG</p>

          <p>Hung Long Vu</p>
          <p>
            {/* Add your address here */}
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>

          <p style={{ marginTop: 24 }}>
            E-Mail:{' '}
            <a href="mailto:info@hunglongvu.com" className="text-zinc-300 hover:text-white transition-colors">
              info@hunglongvu.com
            </a>
          </p>
        </div>

        <p className="font-mono text-xs text-zinc-700 mt-12">
          // Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Hung Long Vu
        </p>
      </div>
    </main>
  );
}
