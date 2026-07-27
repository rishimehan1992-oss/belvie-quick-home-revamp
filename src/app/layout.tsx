import type { Metadata } from "next";
import { Figtree, Italiana } from "next/font/google";
import "./globals.css";

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Belvie — Quick Home Revamp | Bangalore",
  description:
    "Upload your room photo. Get a makeover plan with before/after preview and Bangalore pricing. No room vacation — revamp done in under 4 hours.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "Belvie — Quick Home Revamp",
    description:
      "Indian home makeovers, Bangalore pace. Photo in. Plan out. Done in 4 hours.",
    type: "website",
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
      className={`${italiana.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink">{children}</body>
    </html>
  );
}
