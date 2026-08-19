import { LifestyleApp } from "@/components/LifestyleApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Lifestyle",
  description:
    "Beauty + 0.2 handbags per consult. Not a bags/footwear/watches mix.",
};

export default function LifestylePage() {
  return <LifestyleApp />;
}
