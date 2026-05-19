import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/" className="font-mono text-sm text-zinc-500 hover:text-white transition-colors">
          ← getroasted.wtf
        </Link>

        <h1 className="font-mono font-bold text-2xl mt-10 mb-1" style={{ color: '#E24B4A' }}>
          Privacy Policy
        </h1>
        <p className="font-mono text-xs text-zinc-600 mb-10">// Last updated: May 2026</p>

        <div className="font-mono text-sm" style={{ lineHeight: 1.9 }}>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">What we collect</p>
            <ul className="list-none text-zinc-500 space-y-1">
              <li>— URLs you submit for roasting</li>
              <li>— AI-generated roast results (stored in our database)</li>
              <li>— Screenshots of submitted URLs (via ScreenshotOne)</li>
              <li>— IP addresses for rate limiting (not stored permanently)</li>
            </ul>
          </section>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">Rate limiting</p>
            <p className="text-zinc-500">
              We use your IP address to enforce the daily free roast limit (3 per day).
              IPs are held in memory only and are not written to a database or logs.
            </p>
          </section>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">Third-party services</p>
            <ul className="list-none text-zinc-500 space-y-1">
              <li>— <span className="text-zinc-400">Vercel</span> — hosting (USA) · vercel.com/legal/privacy-policy</li>
              <li>— <span className="text-zinc-400">Supabase</span> — database (EU) · supabase.com/privacy</li>
              <li>— <span className="text-zinc-400">ScreenshotOne</span> — page screenshots · screenshotone.com/privacy-policy</li>
              <li>— <span className="text-zinc-400">Anthropic</span> — AI analysis (USA) · anthropic.com/privacy</li>
              <li>— <span className="text-zinc-400">Stripe</span> — payments (if applicable) · stripe.com/privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">Cookies</p>
            <p className="text-zinc-500">
              We do not use tracking or analytics cookies. No cookie banner is shown
              because no non-essential cookies are set.
            </p>
          </section>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">Your rights</p>
            <ul className="list-none text-zinc-500 space-y-1">
              <li>— Request deletion of your roast from the Hall of Shame</li>
              <li>— Request access to data we hold about you</li>
              <li>— Opt out of public listing at any time</li>
            </ul>
            <p className="text-zinc-600 text-xs mt-3">
              To exercise any of these rights, email us at the address below.
            </p>
          </section>

          <section className="mb-8">
            <p className="text-zinc-300 font-semibold mb-2">Contact</p>
            <p className="text-zinc-500">
              <a href="mailto:hello@getroasted.wtf" className="text-zinc-300 hover:text-white transition-colors">
                hello@getroasted.wtf
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
