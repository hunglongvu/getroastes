import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/" className="font-mono text-sm text-zinc-500 hover:text-white transition-colors">
          ← getroasted.wtf
        </Link>

        <h1 className="font-mono font-bold text-2xl mt-10 mb-2" style={{ color: '#E24B4A' }}>
          Datenschutzerklärung
        </h1>
        <p className="font-mono text-xs text-zinc-600 mb-10">// Placeholder — vollständige Erklärung folgt</p>

        <div className="font-mono text-sm text-zinc-400" style={{ lineHeight: 1.9 }}>
          <p className="text-zinc-300 font-semibold mb-2">Verantwortlicher</p>
          <p className="mb-8">
            Hung Long Vu<br />
            E-Mail: info@hunglongvu.com
          </p>

          <p className="text-zinc-300 font-semibold mb-2">Welche Daten wir verarbeiten</p>
          <ul className="list-none mb-8 space-y-1 text-zinc-500">
            <li>— IP-Adressen (Rate Limiting, temporär)</li>
            <li>— Eingegebene URLs und generierte Roast-Ergebnisse (Supabase)</li>
            <li>— Screenshots der eingegeben URLs (ScreenshotOne API)</li>
          </ul>

          <p className="text-zinc-300 font-semibold mb-2">Drittanbieter</p>
          <ul className="list-none mb-8 space-y-1 text-zinc-500">
            <li>— Vercel (Hosting, USA) — vercel.com/legal/privacy-policy</li>
            <li>— Supabase (Datenbank, EU) — supabase.com/privacy</li>
            <li>— ScreenshotOne (Screenshots) — screenshotone.com/privacy-policy</li>
            <li>— Anthropic (KI-Analyse, USA) — anthropic.com/privacy</li>
          </ul>

          <p className="text-zinc-300 font-semibold mb-2">Cookies</p>
          <p className="text-zinc-500 mb-8">
            Wir verwenden keine Tracking-Cookies. Technisch notwendige Session-Daten werden nur im Speicher gehalten.
          </p>

          <p className="text-zinc-300 font-semibold mb-2">Deine Rechte</p>
          <p className="text-zinc-500">
            Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten.
            Kontakt: info@hunglongvu.com
          </p>
        </div>

        <p className="font-mono text-xs text-zinc-700 mt-12">
          // Vollständige Datenschutzerklärung wird ergänzt.
        </p>
      </div>
    </main>
  );
}
