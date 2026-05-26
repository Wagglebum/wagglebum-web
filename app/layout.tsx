import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wagglebum — Indie games + tools",
  description: "Wagglebum makes indie games and builds the plugins that help other studios ship theirs.",
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
