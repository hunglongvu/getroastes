import Link from 'next/link';

function Divider() {
  return <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
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
          PRIVACY POLICY
        </h1>

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>What we collect</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
            When you use getroasted.wtf, we collect:
          </p>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2.2, color: 'rgba(255,255,255,0.6)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>IP address</strong> — used only for rate limiting (3 free roasts per IP per day). Automatically deleted after 24 hours.</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>URLs you submit for roasting</strong> — stored to display in Hall of Shame and Recent Roasts feed.</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Generated roasts</strong> — stored alongside the submitted URLs.</li>
          </ul>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
            We do <strong style={{ color: '#FF3B30' }}>NOT</strong> collect:
          </p>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2.2, color: 'rgba(255,255,255,0.4)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— Names, emails, or personal information</li>
            <li>— Tracking cookies</li>
            <li>— Analytics data</li>
            <li>— Location data</li>
          </ul>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>How we use it</SectionTitle>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2.2, color: 'rgba(255,255,255,0.6)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>IP addresses:</strong> rate limiting only, not for tracking</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>URLs + roasts:</strong> displayed publicly on the site</li>
          </ul>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Third-party services</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
            We use:
          </p>
          <ul style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 2.4, color: 'rgba(255,255,255,0.5)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Vercel</strong> (hosting) — vercel.com/legal/privacy-policy</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Anthropic Claude API</strong> (AI roast generation) — anthropic.com/legal/privacy</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Upstash Redis</strong> (rate limiting) — upstash.com/trust/privacy.pdf</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.8)' }}>ScreenshotOne</strong> (page screenshots) — screenshotone.com/privacy</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Cloudflare Turnstile</strong> (bot protection) — cloudflare.com/privacypolicy</li>
          </ul>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Your rights (GDPR)</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
            You can request:
          </p>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2.2, color: 'rgba(255,255,255,0.6)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— Deletion of any roast involving your URL</li>
            <li>— Information about data we have stored</li>
            <li>— Correction of any data</li>
          </ul>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
            Contact:{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Cookies</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
            This site uses essential cookies only:
          </p>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2.2, color: 'rgba(255,255,255,0.6)', paddingLeft: 0, listStyle: 'none' }}>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Cloudflare Turnstile</strong> (bot protection)</li>
            <li>— <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Vercel</strong> (hosting essentials)</li>
          </ul>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
            No tracking, no analytics, no third-party advertising cookies.
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Removal Requests</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)' }}>
            If your company&apos;s URL has been roasted and you want it removed from getroasted.wtf,
            email{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
            {' '}with the URL. We remove within 48 hours, no questions asked.
          </p>
        </section>

        <Divider />

        <section>
          <SectionTitle>Changes</SectionTitle>
          <p style={{ fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.4)' }}>
            We may update this policy. Last updated: May 21, 2026.
          </p>
        </section>

      </div>
    </main>
  );
}
