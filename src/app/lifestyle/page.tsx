import { LifestyleApp } from "@/components/LifestyleApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Lifestyle",
  description:
    "Premium handbags, footwear and watches on the consulted customer. 0.5 pieces per consult, ₹8,000–20,000, 40% margin — on top of existing P&L.",
};

export default function LifestylePage() {
  return <LifestyleApp />;
}
