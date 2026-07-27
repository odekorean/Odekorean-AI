import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OdeKorean — Learn Korean with an AI Teacher",
  description:
    "OdeKorean is an AI-powered Korean learning platform: video lessons, TOPIK prep, speaking practice, and a personal AI teacher — built for Uzbekistan and beyond.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
