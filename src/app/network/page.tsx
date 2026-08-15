import { OptimiserApp } from "@/components/OptimiserApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Network cost",
  description:
    "Size the Bengaluru spoke network from the P&L demand mix. The optimum S* feeds contribution and sensitivity.",
};

export default function NetworkPage() {
  return <OptimiserApp />;
}
