import Link from 'next/link';

const S = {
  h2: {
    fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
    color: '#ffffff', marginBottom: 20, marginTop: 0,
  } satisfies React.CSSProperties,
  h3: {
    fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
    color: 'rgba(255,255,255,0.7)', marginBottom: 12, marginTop: 28,
  } satisfies React.CSSProperties,
  body: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 1.85,
    color: 'rgba(255,255,255,0.8)',
  } satisfies React.CSSProperties,
  muted: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 1.85,
    color: 'rgba(255,255,255,0.55)',
  } satisfies React.CSSProperties,
  li: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 2,
    color: 'rgba(255,255,255,0.75)', listStyle: 'none',
  } satisfies React.CSSProperties,
  strong: { color: 'rgba(255,255,255,0.9)' } satisfies React.CSSProperties,
};

function Divider() {
  return <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', margin: '40px 0' }} />;
}

function BackLink() {
  return (
    <Link href="/" style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
      ← back to getroasted.wtf
    </Link>
  );
}

const email = { color: '#FF3B30' as const, textDecoration: 'none' as const };

export default function PrivacyPage() {
  return (
    <main style={{ background: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        <div style={{ marginBottom: 48 }}><BackLink /></div>

        <h1 style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 800, color: '#FF3B30', marginBottom: 8, letterSpacing: 2 }}>
          PRIVACY POLICY
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>
          Last updated: May 21, 2026 · Version 1.0
        </p>

        {/* 1 */}
        <section id="controller" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>1. Controller (Art. 4 No. 7 GDPR)</h2>
          <p style={S.body}>
            Hung Long Vu (resident in Germany)<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany<br />
            Email: <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a>
          </p>
        </section>

        <Divider />

        {/* 2 */}
        <section id="collection" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>2. What We Collect and Why</h2>

          <h3 style={S.h3}>2.1 IP Address</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Purpose:</strong> Rate limiting (max. 3 roasts per IP per day) and bot protection</li>
            <li style={S.li}>— <strong style={S.strong}>Legal basis:</strong> Art. 6 (1) (f) GDPR (legitimate interest in preventing abuse)</li>
            <li style={S.li}>— <strong style={S.strong}>Storage duration:</strong> Automatically deleted after 24 hours</li>
            <li style={S.li}>— <strong style={S.strong}>Storage location:</strong> Upstash Redis (EU-Frankfurt)</li>
          </ul>

          <h3 style={S.h3}>2.2 Submitted URLs and Generated Roasts</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Purpose:</strong> Display in Hall of Shame and Recent Roasts feed; service functionality</li>
            <li style={S.li}>— <strong style={S.strong}>Legal basis:</strong> Art. 6 (1) (a) GDPR (consent via ownership checkbox) and Art. 6 (1) (f) GDPR</li>
            <li style={S.li}>— <strong style={S.strong}>Storage duration:</strong> Until removal request or 12 months, whichever comes first</li>
            <li style={S.li}>— <strong style={S.strong}>Storage location:</strong> Supabase (EU)</li>
          </ul>

          <h3 style={S.h3}>2.3 Server Logs</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Purpose:</strong> Technical operation, security, debugging</li>
            <li style={S.li}>— <strong style={S.strong}>Data:</strong> IP address, user agent, timestamp, requested URL</li>
            <li style={S.li}>— <strong style={S.strong}>Legal basis:</strong> Art. 6 (1) (f) GDPR (legitimate interest)</li>
            <li style={S.li}>— <strong style={S.strong}>Storage duration:</strong> 14 days, then automatically deleted</li>
            <li style={S.li}>— <strong style={S.strong}>Storage location:</strong> Vercel (USA, with EU Standard Contractual Clauses + DPA)</li>
          </ul>

          <h3 id="cookies" style={S.h3}>2.4 Cookies and Similar Technologies</h3>
          <p style={{ ...S.body, marginBottom: 16 }}>
            When you first visit getroasted.wtf, the following cookies may be set:
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>
            <strong style={S.strong}>Strictly Necessary</strong> (No consent required under § 25 (2) TTDSG):
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— <strong style={S.strong}>session:</strong> Vercel hosting session (deleted on browser close)</li>
            <li style={S.li}>— <strong style={S.strong}>cookieNoticeAccepted:</strong> Your cookie notice acknowledgment (local storage, 1 year)</li>
          </ul>
          <p style={{ ...S.body, marginBottom: 8 }}>
            <strong style={S.strong}>Set when you interact with the roast form:</strong>
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— <strong style={S.strong}>cf_*:</strong> Cloudflare Turnstile bot protection (set ONLY on form submission, not on page load via lazy-loading)</li>
          </ul>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            We use lazy-loading to prevent unnecessary cookies on landing page visits.
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>We do <strong style={{ color: '#FF3B30' }}>NOT</strong> use:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            {['Tracking cookies', 'Advertising cookies', 'Analytics tracking', 'Social media tracking pixels', 'Cross-site tracking'].map((item) => (
              <li key={item} style={{ ...S.li, color: 'rgba(255,255,255,0.4)' }}>— {item}</li>
            ))}
          </ul>
          <p style={S.muted}>
            Legal basis: § 25 (2) TTDSG for strictly necessary cookies. Cookies set on form
            interaction fall under legitimate interest (Art. 6 (1) (f) GDPR) for spam and bot prevention.
          </p>
        </section>

        <Divider />

        {/* 3 */}
        <section id="third-party" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>3. Third-Party Services and Data Processing Agreements</h2>
          <p style={{ ...S.body, marginBottom: 28 }}>
            We have entered into Data Processing Agreements (DPAs) with all third-party service providers.
          </p>

          <h3 style={S.h3}>3.1 Vercel Inc. (Hosting – Pro Plan)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> USA</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> IP address, requests, technical logs</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU Standard Contractual Clauses + DPA</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> https://vercel.com/legal/dpa (auto-incorporated via Pro Plan agreement)</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://vercel.com/legal/privacy-policy</li>
          </ul>

          <h3 style={S.h3}>3.2 Anthropic PBC (AI Roast Generation)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> USA</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> Submitted URLs, page content snippets</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU Standard Contractual Clauses + DPA</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> https://www.anthropic.com/legal/data-processing-addendum (auto-incorporated via Commercial Terms of Service)</li>
            <li style={S.li}>— <strong style={S.strong}>Note:</strong> As of May 2026, Anthropic&apos;s policy is that API inputs are not used for model training. For current policy, see: https://privacy.anthropic.com/</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://anthropic.com/legal/privacy</li>
          </ul>

          <h3 style={S.h3}>3.3 Upstash Inc. (Rate Limiting)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> Database in EU-Frankfurt; company USA</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> Hashed IP addresses</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU Standard Contractual Clauses + DPA</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> https://upstash.com/static/trust/dpa.pdf (auto-incorporated via Terms of Service)</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://upstash.com/trust/privacy.pdf</li>
          </ul>

          <h3 style={S.h3}>3.4 Supabase Inc. (Database)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> EU region</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> Submitted URLs, generated roasts</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU hosting + signed DPA (PandaDoc, dated May 21, 2026)</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> https://supabase.com/legal/dpa</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://supabase.com/privacy</li>
          </ul>

          <h3 style={S.h3}>3.5 ScreenshotOne (Page Screenshots)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> EU</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> URLs to be screenshotted</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU hosting (Article 44 GDPR not triggered)</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> Available on request from screenshotone.com</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://screenshotone.com/privacy</li>
          </ul>

          <h3 style={S.h3}>3.6 Cloudflare Inc. (Bot Protection – Turnstile)</h3>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— <strong style={S.strong}>Location:</strong> USA</li>
            <li style={S.li}>— <strong style={S.strong}>Data transferred:</strong> IP address, browser fingerprint, device data</li>
            <li style={S.li}>— <strong style={S.strong}>Safeguard:</strong> EU Standard Contractual Clauses + DPA + EU-U.S. Data Privacy Framework</li>
            <li style={S.li}>— <strong style={S.strong}>DPA:</strong> https://www.cloudflare.com/cloudflare-customer-dpa/ (auto-incorporated via Cloudflare Terms)</li>
            <li style={S.li}>— <strong style={S.strong}>Implementation:</strong> Lazy-loaded on form submission only</li>
            <li style={S.li}>— <strong style={S.strong}>Privacy policy:</strong> https://cloudflare.com/privacypolicy</li>
          </ul>
        </section>

        <Divider />

        {/* 4 */}
        <section id="transfers" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>4. International Data Transfers</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            Some of our service providers are located outside the EU (primarily USA). In such
            cases, we ensure adequate protection through:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— EU Standard Contractual Clauses (SCC) – 2021 version</li>
            <li style={S.li}>— EU-U.S. Data Privacy Framework (where applicable)</li>
            <li style={S.li}>— Encrypted transmission (TLS 1.3 / HTTPS)</li>
            <li style={S.li}>— Encrypted storage (AES-256 at rest)</li>
          </ul>
          <p style={{ ...S.muted, marginBottom: 12 }}>
            You acknowledge that, despite these safeguards, US authorities may have access to
            data under US surveillance laws (CLOUD Act, FISA 702) as established in the Schrems II
            ruling of the European Court of Justice (Case C-311/18).
          </p>
          <p style={S.muted}>
            We minimize US transfers where possible by preferring EU-located providers and
            EU-region deployments.
          </p>
        </section>

        <Divider />

        {/* 5 */}
        <section id="rights" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>5. Your Rights Under GDPR</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            You have the following rights regarding your personal data:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 24px' }}>
            {[
              ['Art. 15 GDPR (Right of access)', 'Request information about data we have on you'],
              ['Art. 16 GDPR (Right to rectification)', 'Correction of inaccurate data'],
              ['Art. 17 GDPR (Right to erasure / "right to be forgotten")', 'Deletion of your data'],
              ['Art. 18 GDPR (Right to restriction)', 'Limit processing'],
              ['Art. 20 GDPR (Right to data portability)', 'Receive your data in machine-readable format'],
              ['Art. 21 GDPR (Right to object)', 'Object to processing based on legitimate interest'],
              ['Art. 77 GDPR (Right to lodge a complaint)', 'With the supervisory authority'],
            ].map(([k, v]) => (
              <li key={k as string} style={S.li}>
                — <strong style={S.strong}>{k}:</strong> {v}
              </li>
            ))}
          </ul>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            To exercise these rights, contact{' '}
            <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a>.
            {' '}We respond within 30 days (Art. 12 (3) GDPR).
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>
            <strong style={S.strong}>Supervisory authority for Hessen:</strong>
          </p>
          <p style={{ ...S.muted }}>
            Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
            Postfach 3163, 65021 Wiesbaden<br />
            <a href="https://datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)' }}>
              https://datenschutz.hessen.de
            </a>
          </p>
        </section>

        <Divider />

        {/* 6 */}
        <section id="removal" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>6. URL Removal Requests</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            If your URL has been submitted to getroasted.wtf without your authorization, you
            can request immediate removal:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={S.li}>— Email: <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a></li>
            <li style={S.li}>— Subject: &ldquo;Removal Request&rdquo;</li>
            <li style={S.li}>— Include: The URL to be removed</li>
          </ul>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            We respond and remove within 48 hours, no questions asked. No verification of
            ownership is required – we operate on good faith for removal requests.
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>After removal:</p>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>— URL is added to a technical blacklist</li>
            <li style={S.li}>— Re-submission is automatically prevented</li>
            <li style={S.li}>— All cached versions are purged</li>
            <li style={S.li}>— Share cards become unavailable</li>
          </ul>
        </section>

        <Divider />

        {/* 7 */}
        <section id="security" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>7. Data Security</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>We use industry-standard security measures:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={S.li}>— HTTPS/TLS 1.3 encryption for all data transmission</li>
            <li style={S.li}>— AES-256 encrypted database storage</li>
            <li style={S.li}>— Limited access controls (least-privilege principle)</li>
            <li style={S.li}>— Regular security updates</li>
            <li style={S.li}>— Bot protection via Cloudflare Turnstile</li>
          </ul>
          <p style={S.muted}>
            However, no internet transmission can be 100% secure. We notify users and
            authorities of any data breach within 72 hours as required by Art. 33 GDPR.
          </p>
        </section>

        <Divider />

        {/* 8 */}
        <section id="children" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>8. Children&apos;s Privacy</h2>
          <p style={S.muted}>
            This service is not directed at children under 16. We do not knowingly collect
            data from minors. If you believe a minor has used this service, please contact us
            at{' '}
            <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a>
            {' '}for immediate data deletion.
          </p>
        </section>

        <Divider />

        {/* 9 */}
        <section id="changes" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>9. Changes to This Policy</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            We may update this Privacy Policy from time to time. Material changes will be:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={S.li}>— Indicated by updating the &ldquo;Last updated&rdquo; date and version number</li>
            <li style={S.li}>— Documented in the version history section below</li>
            <li style={S.li}>— For substantial changes affecting user rights: notified via website banner</li>
          </ul>
          <p style={S.muted}>
            By continuing to use the service after changes, you accept the updated policy.
          </p>
        </section>

        <Divider />

        {/* 10 */}
        <section id="contact" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>10. Contact</h2>
          <p style={{ ...S.body, marginBottom: 8 }}>
            For any privacy-related questions or to exercise your rights:
          </p>
          <p style={S.body}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany<br />
            Email: <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a><br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Response time: Within 30 days (typically 24–48 hours)</span>
          </p>
        </section>

        <Divider />

        {/* 11 */}
        <section id="automated" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>11. Automated Decision-Making (Art. 22 GDPR)</h2>
          <p style={{ ...S.body, marginBottom: 16 }}>
            getroasted.wtf uses AI (Anthropic&apos;s Claude API) to generate automated roast
            scores (0–100) and text content for submitted URLs. This constitutes
            &ldquo;automated processing&rdquo; under Art. 22 GDPR.
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>However, this processing:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— Does NOT produce legal effects on data subjects</li>
            <li style={S.li}>— Is for entertainment and satirical purposes only</li>
            <li style={S.li}>— Does NOT involve profiling of individuals</li>
            <li style={S.li}>— Does NOT affect employment, credit, legal status, or any consequential decisions</li>
            <li style={S.li}>— Does NOT use personal data beyond the publicly accessible URL content</li>
          </ul>
          <p style={{ ...S.body, marginBottom: 8 }}>User rights regarding automated outputs:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— Right to human review of any generated roast</li>
            <li style={S.li}>— Right to removal within 48 hours (no questions asked)</li>
            <li style={S.li}>— Right to correction if factually inaccurate</li>
            <li style={S.li}>— Right to explanation of the AI scoring logic</li>
          </ul>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            The AI scoring is satirical in nature and does NOT represent factual evaluation of
            business quality, product merit, or individual capability.
          </p>
          <p style={{ ...S.body, marginBottom: 8 }}>For complete transparency, we can provide on request:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={S.li}>— The exact prompt used for generation</li>
            <li style={S.li}>— The AI model and version</li>
            <li style={S.li}>— The timestamp of generation</li>
            <li style={S.li}>— The original URL content at time of roast</li>
          </ul>
          <p style={S.muted}>
            Contact <a href="mailto:info@hunglongvu.com" style={email}>info@hunglongvu.com</a> for any of these requests.
          </p>
        </section>

        <Divider />

        {/* 12 */}
        <section id="marketing" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>12. Marketing Communications</h2>
          <p style={S.muted}>
            We currently do not operate a newsletter or marketing communications. If we
            introduce such services in the future, this Privacy Policy will be updated
            accordingly with separate consent mechanisms (double opt-in) as required by
            § 7 Abs. 2 UWG.
          </p>
        </section>

        <Divider />

        {/* 13 */}
        <section id="version-history" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>13. Version History</h2>
          <ul style={{ paddingLeft: 0, margin: 0 }}>
            <li style={S.li}>
              — <strong style={S.strong}>v1.0 (May 21, 2026):</strong> Initial release with full GDPR + TMG + TTDSG compliance, including DPAs with all subprocessors
            </li>
          </ul>
        </section>

        <Divider />

        <div style={{ paddingTop: 8 }}><BackLink /></div>

      </div>
    </main>
  );
}
