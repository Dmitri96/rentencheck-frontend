import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Variable serif for display headings + hero KPIs.
//
// Fraunces is a true variable font; weights 300-900 are interpolated server-side
// when Tailwind classes like `font-medium` apply. Variable axes (opsz, SOFT,
// WONK) are driven from globals.css via `font-variation-settings` — we don't
// declare them in `axes:[...]` because Turbopack's font subset resolver chokes
// on non-`opsz`/`wght` axes (Module not found:
// `@vercel/turbopack-next/internal/font/google/font`).
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rentenblick — Rentenberatung",
  description: "Rentenberatung und Rentenchecks für Finanzberater",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" duration={4000} closeButton />
      </body>
    </html>
  );
}
