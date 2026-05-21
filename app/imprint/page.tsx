import Link from 'next/link';

const S = {
  h2: {
    fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
    color: '#ffffff', marginBottom: 20, marginTop: 0,
  } satisfies React.CSSProperties,
  body: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 1.85,
    color: 'rgba(255,255,255,0.8)',
  } satisfies React.CSSProperties,
  muted: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 1.85,
    color: 'rgba(255,255,255,0.5)',
  } satisfies React.CSSProperties,
  li: {
    fontFamily: 'monospace', fontSize: 14, lineHeight: 2,
    color: 'rgba(255,255,255,0.75)', listStyle: 'none',
  } satisfies React.CSSProperties,
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

export default function ImprintPage() {
  return (
    <main style={{ background: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        <div style={{ marginBottom: 48 }}><BackLink /></div>

        <h1 style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 800, color: '#FF3B30', marginBottom: 8, letterSpacing: 2 }}>
          IMPRINT
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>
          Last updated: May 21, 2026 · Version 1.0
        </p>

        {/* 1 */}
        <section id="information" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Information according to § 5 TMG / § 18 MStV</h2>
          <p style={S.body}>
            Hung Long Vu (resident in Germany)<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany
          </p>
        </section>

        <Divider />

        {/* 2 */}
        <section id="contact" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Contact</h2>
          <p style={S.body}>
            Email:{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
          </p>
          <p style={{ ...S.muted, marginTop: 8 }}>(Phone available on request via email)</p>
        </section>

        <Divider />

        {/* 3 */}
        <section id="responsible" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Responsible for journalistic-editorial content according to § 18 Abs. 2 MStV</h2>
          <p style={S.body}>
            Hung Long Vu (resident in Germany)<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany
          </p>
        </section>

        <Divider />

        {/* 4 */}
        <section id="eu-dispute" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>EU Dispute Resolution</h2>
          <p style={S.muted}>
            The European Commission provides a platform for online dispute resolution (OS):{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.45)' }}>
              https://ec.europa.eu/consumers/odr
            </a>
            <br />
            You can find our email address above.
          </p>
        </section>

        <Divider />

        {/* 5 */}
        <section id="consumer-dispute" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Consumer Dispute Resolution</h2>
          <p style={S.muted}>
            We are neither willing nor obliged to participate in dispute resolution proceedings
            before a consumer arbitration board.
          </p>
        </section>

        <Divider />

        {/* 6 */}
        <section id="liability-content" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Liability for Content</h2>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            As a service provider, we are responsible for our own content on these pages in
            accordance with general laws pursuant to § 7 para. 1 TMG. According to §§ 8 to 10
            TMG, however, we are not obligated to monitor transmitted or stored third-party
            information or to investigate circumstances that indicate illegal activity.
          </p>
          <p style={S.muted}>
            Obligations to remove or block the use of information under general laws remain
            unaffected. However, liability in this regard is only possible from the point in
            time at which a specific legal violation becomes known. Upon becoming aware of
            corresponding legal violations, we will remove this content immediately.
          </p>
        </section>

        <Divider />

        {/* 7 */}
        <section id="liability-user" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Liability for User-Submitted Content</h2>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            By submitting a URL, users explicitly confirm via checkbox that they own the page
            or have explicit permission from the owner. getroasted.wtf operates under the
            &ldquo;good faith&rdquo; principle, assuming truthful user input.
          </p>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            We acknowledge that unauthorized submissions may occur despite this safeguard.
            We commit to:
          </p>
          <ul style={{ paddingLeft: 0, margin: '0 0 16px' }}>
            <li style={S.li}>1. Immediate removal within 48 hours of any valid complaint</li>
            <li style={S.li}>2. Technical prevention of re-submission of removed URLs</li>
            <li style={S.li}>3. Full cooperation with affected parties for resolution</li>
            <li style={S.li}>4. No commercial exploitation of user-submitted content</li>
            <li style={S.li}>5. No long-term storage of roasts after removal request</li>
          </ul>
          <p style={S.muted}>
            If you are the owner of a roasted URL and did not authorize submission, contact{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
            {' '}immediately. We will remove the content without verification requirements.
          </p>
        </section>

        <Divider />

        {/* 8 */}
        <section id="liability-links" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Liability for Links</h2>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            Our offer contains links to external websites of third parties, on whose content
            we have no influence. Therefore, we cannot assume any liability for these external
            contents. The respective provider or operator of the pages is always responsible
            for the content of the linked pages. The linked pages were checked for possible
            legal violations at the time of linking. Illegal content was not recognizable at
            the time of linking.
          </p>
          <p style={S.muted}>
            A permanent control of the content of the linked pages is not reasonable without
            concrete evidence of an infringement. Upon becoming aware of legal violations, we
            will remove such links immediately.
          </p>
        </section>

        <Divider />

        {/* 9 */}
        <section id="copyright" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Copyright</h2>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            The content and works on these pages created by the site operator are subject to
            German copyright law. Duplication, processing, distribution, or any form of
            commercialization of such material beyond the scope of the copyright law shall
            require the prior written consent of its respective author or creator.
          </p>
          <p style={S.muted}>
            User-submitted URLs remain the property of their respective owners. Screenshots of
            submitted websites are used solely for the purpose of generating roasts and are not
            redistributed beyond display on getroasted.wtf and the sharing card feature.
          </p>
        </section>

        <Divider />

        {/* 10 */}
        <section id="satire" style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>Satire Disclaimer</h2>
          <p style={{ ...S.muted, marginBottom: 16 }}>
            getroasted.wtf is a satirical AI tool protected under Art. 5 GG (German Basic Law –
            freedom of art and satire).
          </p>
          <p style={{ ...S.body, marginBottom: 12 }}>All &ldquo;roasts&rdquo; are:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— AI-generated jokes intended as humor</li>
            <li style={S.li}>— Satirical in nature, not factual claims</li>
            <li style={S.li}>— Not representing opinions of getroasted.wtf or its operator</li>
            <li style={S.li}>— Not evaluations of business quality, product merit, or individual capability</li>
          </ul>
          <p style={{ ...S.body, marginBottom: 12 }}>They do NOT constitute:</p>
          <ul style={{ paddingLeft: 0, margin: '0 0 20px' }}>
            <li style={S.li}>— Defamation (Beleidigung)</li>
            <li style={S.li}>— Disparagement of credit (Kreditgefährdung)</li>
            <li style={S.li}>— Unfair competition (UWG)</li>
            <li style={S.li}>— Personality rights violations</li>
          </ul>
          <p style={S.muted}>
            If you believe specific content on this site violates your rights, please contact{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
            {' '}for immediate removal within 48 hours.
          </p>
        </section>

        <Divider />

        <div style={{ paddingTop: 8 }}><BackLink /></div>

      </div>
    </main>
  );
}
