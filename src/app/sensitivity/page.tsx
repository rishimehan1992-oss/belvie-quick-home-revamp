import { SensitivityApp } from "@/components/SensitivityApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Sensitivity",
  description:
    "P&L sensitivity to consult AOV, non-consult AOV, non-consults per consult, conversion, visit cost, margin and k.",
};

export default function SensitivityPage() {
  return <SensitivityApp />;
}
