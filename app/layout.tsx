import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://wagglebum.com'),
  title: {
    default: 'Wagglebum — Indie games + tools',
    template: '%s — Wagglebum',
  },
  description: 'Wagglebum makes indie games and builds the plugins that help other studios ship theirs. One dog-shaped team, two kinds of work.',
  openGraph: {
    siteName: 'Wagglebum',
    type: 'website',
    images: [{ url: '/brand/logo.png', width: 512, height: 512, alt: 'Wagglebum' }],
  },
  twitter: {
    card: 'summary',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans">{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-NLLY81XMGM"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NLLY81XMGM');
        `}
      </Script>
    </html>
  );
}
