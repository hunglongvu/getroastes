import Link from 'next/link';

function Divider() {
  return <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 12, marginTop: 24 }}>
      {children}
    </h3>
  );
}

const body: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 14, lineHeight: 2, color: 'rgba(255,255,255,0.65)',
};

const strong: React.CSSProperties = { color: 'rgba(255,255,255,0.85)' };

const li: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 14, lineHeight: 2.1,
  color: 'rgba(255,255,255,0.6)', listStyle: 'none',
};

const email = { color: '#FF3B30' as const, textDecoration: 'none' as const };

export default function PrivacyPage() {
  return (
    <main style={{ background: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← getroasted.wtf
          </Link>
        </div>

        <h1 style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#FF3B30', marginBottom: 8, letterSpacing: 2 }}>
          PRIVACY POLICY
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>
          Last updated: May 21, 2026
        </p>

        {/* 1 */}
        <section style={{ marginBottom: 40 }}>
          <H2>1. Controller (Art. 4 No. 7 GDPR)</H2>
          <p style={body}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany<br />
            Email:{' '}
            <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a>
          </p>
        </section>

        <Divider />

        {/* 2 */}
        <section style={{ marginBottom: 40 }}>
          <H2>2. What We Collect and Why</H2>

          <H3>2.1 IP Address</H3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={li}>— <strong style={strong}>Purpose:</strong> Rate limiting (max. 3 roasts per IP per day) and bot protection</li>
            <li style={li}>— <strong style={strong}>Legal basis:</strong> Art. 6 (1) (f) GDPR (legitimate interest in preventing abuse)</li>
            <li style={li}>— <strong style={strong}>Storage duration:</strong> Automatically deleted after 24 hours</li>
            <li style={li}>— <strong style={strong}>Storage location:</strong> Upstash Redis (EU-Frankfurt)</li>
          </ul>

          <H3>2.2 Submitted URLs and Generated Roasts</H3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={li}>— <strong style={strong}>Purpose:</strong> Display in Hall of Shame and Recent Roasts feed; service functionality</li>
            <li style={li}>— <strong style={strong}>Legal basis:</strong> Art. 6 (1) (a) GDPR (consent via ownership checkbox) and Art. 6 (1) (f) GDPR</li>
            <li style={li}>— <strong style={strong}>Storage duration:</strong> Until removal request or 12 months</li>
            <li style={li}>— <strong style={strong}>Storage location:</strong> Supabase (EU)</li>
          </ul>

          <H3>2.3 Server Logs</H3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={li}>— <strong style={strong}>Purpose:</strong> Technical operation, security, debugging</li>
            <li style={li}>— <strong style={strong}>Data:</strong> IP address, user agent, timestamp, requested URL</li>
            <li style={li}>— <strong style={strong}>Legal basis:</strong> Art. 6 (1) (f) GDPR (legitimate interest)</li>
            <li style={li}>— <strong style={strong}>Storage duration:</strong> 14 days, then automatically deleted</li>
            <li style={li}>— <strong style={strong}>Storage location:</strong> Vercel (USA, with EU Standard Contractual Clauses)</li>
          </ul>

          <H3>2.4 Cookies and Similar Technologies</H3>
          <p style={{ ...body, marginBottom: 12 }}>We use ONLY essential cookies necessary for site operation:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={li}>— <strong style={strong}>Cloudflare Turnstile cookies:</strong> Bot protection (deactivated in current version, may be re-enabled)</li>
            <li style={li}>— <strong style={strong}>Vercel session cookies:</strong> Hosting infrastructure</li>
            <li style={li}>— <strong style={strong}>Local Storage:</strong> Rate limit awareness (optional)</li>
          </ul>
          <p style={{ ...body, marginBottom: 12 }}>We do <strong style={{ color: '#FF3B30' }}>NOT</strong> use:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={{ ...li, color: 'rgba(255,255,255,0.4)' }}>— Tracking cookies</li>
            <li style={{ ...li, color: 'rgba(255,255,255,0.4)' }}>— Advertising cookies</li>
            <li style={{ ...li, color: 'rgba(255,255,255,0.4)' }}>— Analytics tracking</li>
            <li style={{ ...li, color: 'rgba(255,255,255,0.4)' }}>— Social media tracking pixels</li>
          </ul>
          <p style={body}>
            <strong style={strong}>Legal basis for essential cookies:</strong> § 25 (2) TTDSG (strictly necessary for service).
          </p>
        </section>

        <Divider />

        {/* 3 */}
        <section style={{ marginBottom: 40 }}>
          <H2>3. Third-Party Services</H2>
          <p style={{ ...body, marginBottom: 20 }}>
            Some data is processed by third-party services. We have data processing agreements
            (DPA) in place where required.
          </p>

          {[
            {
              title: '3.1 Vercel Inc. (Hosting)',
              items: [
                ['Location', 'USA'],
                ['Data transferred', 'IP address, requests, technical logs'],
                ['Safeguard', 'EU Standard Contractual Clauses'],
                ['Privacy policy', 'https://vercel.com/legal/privacy-policy'],
              ],
            },
            {
              title: '3.2 Anthropic PBC (AI Roast Generation)',
              items: [
                ['Location', 'USA'],
                ['Data transferred', 'Submitted URLs, page content snippets'],
                ['Safeguard', 'EU Standard Contractual Clauses'],
                ['Note', 'Anthropic does not use API inputs for training'],
                ['Privacy policy', 'https://anthropic.com/legal/privacy'],
              ],
            },
            {
              title: '3.3 Upstash Inc. (Rate Limiting)',
              items: [
                ['Location', 'Database in EU-Frankfurt; company USA'],
                ['Data transferred', 'Hashed IP addresses'],
                ['Safeguard', 'EU Standard Contractual Clauses'],
                ['Privacy policy', 'https://upstash.com/trust/privacy.pdf'],
              ],
            },
            {
              title: '3.4 Supabase Inc. (Database)',
              items: [
                ['Location', 'EU region'],
                ['Data transferred', 'Submitted URLs, roasts'],
                ['Safeguard', 'EU hosting'],
                ['Privacy policy', 'https://supabase.com/privacy'],
              ],
            },
            {
              title: '3.5 ScreenshotOne (Page Screenshots)',
              items: [
                ['Location', 'EU'],
                ['Data transferred', 'URLs to be screenshotted'],
                ['Privacy policy', 'https://screenshotone.com/privacy'],
              ],
            },
            {
              title: '3.6 Cloudflare Inc. (Bot Protection – Turnstile)',
              items: [
                ['Location', 'USA'],
                ['Data transferred', 'IP address, browser fingerprint, device data'],
                ['Safeguard', 'EU Standard Contractual Clauses'],
                ['Privacy policy', 'https://cloudflare.com/privacypolicy'],
              ],
            },
          ].map(({ title, items }) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <H3>{title}</H3>
              <ul style={{ paddingLeft: 0, margin: 0 }}>
                {items.map(([k, v]) => (
                  <li key={k} style={li}>
                    — <strong style={strong}>{k}:</strong> {v}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <Divider />

        {/* 4 */}
        <section style={{ marginBottom: 40 }}>
          <H2>4. International Data Transfers</H2>
          <p style={{ ...body, marginBottom: 16 }}>
            Some of our service providers are located outside the EU (primarily USA). In such
            cases, we ensure adequate protection through:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={li}>— EU Standard Contractual Clauses (SCC)</li>
            <li style={li}>— EU-U.S. Data Privacy Framework (where applicable)</li>
            <li style={li}>— Encrypted transmission (TLS/HTTPS)</li>
          </ul>
          <p style={body}>
            You acknowledge that, despite these safeguards, US authorities may have access to
            data under US surveillance laws (see Schrems II ruling).
          </p>
        </section>

        <Divider />

        {/* 5 */}
        <section style={{ marginBottom: 40 }}>
          <H2>5. Your Rights Under GDPR</H2>
          <p style={{ ...body, marginBottom: 16 }}>You have the following rights:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 24px' }}>
            {[
              ['Art. 15 GDPR – Right of access', 'Request information about data we have on you'],
              ['Art. 16 GDPR – Right to rectification', 'Correction of inaccurate data'],
              ['Art. 17 GDPR – Right to erasure ("right to be forgotten")', 'Deletion of your data'],
              ['Art. 18 GDPR – Right to restriction', 'Limit processing'],
              ['Art. 20 GDPR – Right to data portability', 'Receive your data in machine-readable format'],
              ['Art. 21 GDPR – Right to object', 'Object to processing based on legitimate interest'],
              ['Art. 77 GDPR – Right to lodge a complaint', 'With the supervisory authority'],
            ].map(([k, v]) => (
              <li key={k} style={li}>— <strong style={strong}>{k}:</strong> {v}</li>
            ))}
          </ul>
          <p style={{ ...body, marginBottom: 8 }}>
            <strong style={strong}>Supervisory authority for Hessen:</strong>
          </p>
          <p style={{ ...body, color: 'rgba(255,255,255,0.5)' }}>
            Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
            Postfach 3163, 65021 Wiesbaden<br />
            <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)' }}>
              https://datenschutz.hessen.de
            </a>
          </p>
        </section>

        <Divider />

        {/* 6 */}
        <section style={{ marginBottom: 40 }}>
          <H2>6. URL Removal Requests</H2>
          <p style={{ ...body, marginBottom: 16 }}>
            If your company&apos;s URL has been submitted to getroasted.wtf without your
            authorization, you can request immediate removal:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={li}>— Email: <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a></li>
            <li style={li}>— Subject: &ldquo;Removal Request&rdquo;</li>
            <li style={li}>— Include: The URL to be removed</li>
          </ul>
          <p style={body}>We respond and remove within 48 hours, no questions asked.</p>
        </section>

        <Divider />

        {/* 7 */}
        <section style={{ marginBottom: 40 }}>
          <H2>7. Data Security</H2>
          <p style={{ ...body, marginBottom: 16 }}>We use industry-standard security measures:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={li}>— HTTPS/TLS encryption for all data transmission</li>
            <li style={li}>— Encrypted database storage</li>
            <li style={li}>— Limited access controls</li>
            <li style={li}>— Regular security updates</li>
          </ul>
          <p style={body}>However, no internet transmission can be 100% secure.</p>
        </section>

        <Divider />

        {/* 8 */}
        <section style={{ marginBottom: 40 }}>
          <H2>8. Children&apos;s Privacy</H2>
          <p style={body}>
            This service is not directed at children under 16. We do not knowingly collect data
            from minors. If you believe a minor has used this service, please contact us.
          </p>
        </section>

        <Divider />

        {/* 9 */}
        <section style={{ marginBottom: 40 }}>
          <H2>9. Changes to This Policy</H2>
          <p style={body}>
            We may update this Privacy Policy from time to time. Material changes will be
            indicated by updating the &ldquo;Last updated&rdquo; date at the top.
            <br /><br />
            By continuing to use the service after changes, you accept the updated policy.
          </p>
        </section>

        <Divider />

        {/* 10 */}
        <section>
          <H2>10. Contact</H2>
          <p style={body}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany<br />
            Email:{' '}
            <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a>
          </p>
        </section>

      </div>
    </main>
  );
}
