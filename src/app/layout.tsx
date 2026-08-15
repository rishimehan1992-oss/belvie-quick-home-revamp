import type { Metadata, Viewport } from "next";
import { PasswordGate } from "@/components/PasswordGate";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
  ),
  title: "Belvie — Network Cost Optimiser",
  description:
    "Interactive model for how many spokes the Belvie fulfilment network should have in Bengaluru, and what the whole network costs per month.",
  openGraph: {
    title: "Belvie — Network Cost Optimiser",
    description:
      "Change any operating assumption; the model re-solves the Bengaluru spoke network in under a millisecond.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-cream font-sans text-ink">
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
