import { PnlApp } from "@/components/PnlApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Network P&L",
  description:
    "Overall network contribution as consults increase. Visit cost, AOV, conversion, and gross margin are variable.",
};

export default function PnlPage() {
  return <PnlApp />;
}
