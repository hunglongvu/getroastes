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

const body: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.75)',
};

const muted: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 15, lineHeight: 2, color: 'rgba(255,255,255,0.5)',
};

export default function ImprintPage() {
  return (
    <main style={{ background: '#000000', minHeight: '100vh', color: '#ffffff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← getroasted.wtf
          </Link>
        </div>

        <h1 style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#FF3B30', marginBottom: 8, letterSpacing: 2 }}>
          IMPRINT
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 56 }}>
          Last updated: May 21, 2026
        </p>

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Information according to § 5 TMG / § 18 MStV</SectionTitle>
          <p style={body}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Contact</SectionTitle>
          <p style={body}>
            Email:{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>(Phone available on request)</span>
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Responsible for content according to § 18 Abs. 2 MStV</SectionTitle>
          <p style={body}>
            Hung Long Vu<br />
            Bahnstraße 15<br />
            65205 Wiesbaden<br />
            Germany
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>EU Dispute Resolution</SectionTitle>
          <p style={muted}>
            The European Commission provides a platform for online dispute resolution (OS):{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.5)' }}>
              https://ec.europa.eu/consumers/odr
            </a>
            <br />
            You can find our email address above.
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Consumer Dispute Resolution</SectionTitle>
          <p style={muted}>
            We are neither willing nor obliged to participate in dispute resolution proceedings
            before a consumer arbitration board.
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Liability for Content</SectionTitle>
          <p style={{ ...muted, marginBottom: 16 }}>
            As a service provider, we are responsible for our own content on these pages in
            accordance with general laws pursuant to § 7 para. 1 TMG. According to §§ 8 to 10
            TMG, however, we are not obligated to monitor transmitted or stored third-party
            information or to investigate circumstances that indicate illegal activity.
          </p>
          <p style={{ ...muted, marginBottom: 16 }}>
            Obligations to remove or block the use of information under general laws remain
            unaffected. However, liability in this regard is only possible from the point in time
            at which a specific legal violation becomes known. Upon becoming aware of corresponding
            legal violations, we will remove this content immediately.
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Liability for Links</SectionTitle>
          <p style={{ ...muted, marginBottom: 16 }}>
            Our offer contains links to external websites of third parties, on whose content we
            have no influence. Therefore, we cannot assume any liability for these external
            contents. The respective provider or operator of the pages is always responsible for
            the content of the linked pages. The linked pages were checked for possible legal
            violations at the time of linking. Illegal content was not recognizable at the time
            of linking.
          </p>
          <p style={muted}>
            A permanent control of the content of the linked pages is not reasonable without
            concrete evidence of an infringement. Upon becoming aware of legal violations, we
            will remove such links immediately.
          </p>
        </section>

        <Divider />

        <section style={{ marginBottom: 40 }}>
          <SectionTitle>Copyright</SectionTitle>
          <p style={{ ...muted, marginBottom: 16 }}>
            The content and works on these pages created by the site operator are subject to
            German copyright law. Duplication, processing, distribution, or any form of
            commercialization of such material beyond the scope of the copyright law shall require
            the prior written consent of its respective author or creator.
          </p>
          <p style={muted}>
            User-submitted URLs remain the property of their respective owners. Screenshots of
            submitted websites are used solely for the purpose of generating roasts and are not
            redistributed.
          </p>
        </section>

        <Divider />

        <section>
          <SectionTitle>Satire Disclaimer</SectionTitle>
          <p style={{ ...muted, marginBottom: 16 }}>
            getroasted.wtf is a satirical AI tool. All &ldquo;roasts&rdquo; are AI-generated
            jokes intended as humor. They do NOT represent factual claims, opinions, or
            evaluations about any company, product, service, or person mentioned.
          </p>
          <p style={muted}>
            If you believe content on this site violates your rights, please contact{' '}
            <a href="mailto:info@hunglongvu.com" style={{ color: '#FF3B30', textDecoration: 'none' }}>
              info@hunglongvu.com
            </a>
            {' '}for immediate removal within 48 hours.
          </p>
        </section>

      </div>
    </main>
  );
}
