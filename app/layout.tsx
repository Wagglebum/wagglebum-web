import type { Metadata } from "next";
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
    </html>
  );
}
