import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
  ),
  title: "Belvie — Network model",
  description:
    "Start with P&L inputs, size the Bengaluru fulfilment network, then stress-test the result.",
  openGraph: {
    title: "Belvie — Network model",
    description:
      "P&L first, then the cost-optimal spoke network, then sensitivity. Bengaluru planning model.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
