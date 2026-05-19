import type { Metadata } from "next";
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
  title: 'getroasted.wtf — AI Landing Page Roaster',
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
        <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #111' }}>
          <span className="font-mono text-xs" style={{ color: '#333' }}>
            <a href="/impressum" style={{ color: '#333', textDecoration: 'none' }} className="hover:text-zinc-500 transition-colors">Impressum</a>
            {' · '}
            <a href="/datenschutz" style={{ color: '#333', textDecoration: 'none' }} className="hover:text-zinc-500 transition-colors">Datenschutz</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
