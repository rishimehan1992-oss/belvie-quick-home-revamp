import { PnlApp } from "@/components/PnlApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Network P&L",
  description:
    "Start with commercial inputs. Consults, conversion and mix become demand for the Bengaluru network model.",
};

export default function HomePage() {
  return <PnlApp />;
}
