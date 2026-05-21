import Link from 'next/link';

export default function ImprintPage() {
  return (
    <main style={{ background: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        <div style={{ marginBottom: 48 }}>
          <Link
            href="/"
            style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
          >
            ← getroasted.wtf
          </Link>
        </div>

        <h1 style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#FF3B30', marginBottom: 56, letterSpacing: 2 }}>
          IMPRINT
        </h1>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Information according to § 5 TMG
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany
          </p>
        </section>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Contact
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            Email:{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
          </p>
        </section>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Responsible for content (§ 55 Abs. 2 RStV)
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden
          </p>
        </section>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />

        <section>
          <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
            Disclaimer
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
            The content of this website is created with utmost care. However, we cannot guarantee
            the accuracy, completeness, or timeliness of the content.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.5)' }}>
            getroasted.wtf is a satirical AI tool. Roasts are AI-generated and do not represent
            factual opinions about any company, person, or product mentioned. All roasts are
            intended as humor.
          </p>
        </section>

      </div>
    </main>
  );
}
