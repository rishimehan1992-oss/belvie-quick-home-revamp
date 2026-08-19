import { LifestyleApp } from "@/components/LifestyleApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Lifestyle",
  description:
    "Beauty only vs beauty + lifestyle: complete P&L and unit economics on the same consult.",
};

export default function LifestylePage() {
  return <LifestyleApp />;
}
