import { OpsSimApp } from "@/components/OpsSimApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Simulate",
  description:
    "Watch advisors and vans move on the Bengaluru hub–spoke map at a thin city and at today’s S*.",
};

export default function SimulatePage() {
  return <OpsSimApp />;
}
