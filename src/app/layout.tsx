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

// Variable serif with an optical-size axis — display headings + hero KPIs.
// Restricted to weights/axes we actually use to keep payload lean.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
  weight: ["400", "500", "600", "700"],
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
