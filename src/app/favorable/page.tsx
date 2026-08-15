import { FavorableApp } from "@/components/FavorableApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Favorable",
  description:
    "Green and red zones of AOV, non-consults per consult, and k where a mature city becomes profitable, with sampling cost as the fourth lever.",
};

export default function FavorablePage() {
  return <FavorableApp />;
}
