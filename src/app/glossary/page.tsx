import { GlossaryApp } from "@/components/GlossaryApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Line items",
  description:
    "Definitions for every input and factor in the Belvie network model: line-haul, circuity, tour constant, CAC, LTV, and the cost stack.",
};

export default function GlossaryPage() {
  return <GlossaryApp />;
}
