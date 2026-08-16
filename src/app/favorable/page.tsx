import { FavorableApp } from "@/components/FavorableApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Favorable",
  description:
    "Pick which levers to sweep — AOV, reorders, k, conversion, visit cost, sampling, margin — and read the green pocket at scale.",
};

export default function FavorablePage() {
  return <FavorableApp />;
}
