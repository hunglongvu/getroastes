import type { Metadata } from "next";
import CookieNotice from './components/CookieNotice';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Let's Get Roasted",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>",
  },
  description: 'Paste your landing page URL. Get brutally roasted by AI. Share on X. Go viral.',
  openGraph: {
    title: 'getroasted.wtf — AI Landing Page Roaster',
    description: 'First the AI roasts you. Then the internet does.',
    url: 'https://getroasted.wtf',
    siteName: 'getroasted.wtf',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'getroasted.wtf',
    description: 'First the AI roasts you. Then the internet does.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        {children}
        <CookieNotice />
        <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #111' }}>
          <span className="font-mono text-xs" style={{ color: '#333' }}>
            <a href="/imprint" style={{ color: '#333', textDecoration: 'none' }} className="hover:text-zinc-500 transition-colors">Imprint</a>
            {' · '}
            <a href="/privacy" style={{ color: '#333', textDecoration: 'none' }} className="hover:text-zinc-500 transition-colors">Privacy Policy</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
