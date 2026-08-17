import { InventoryApp } from "@/components/InventoryApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Inventory",
  description:
    "How 900 spoke SKUs and a 1,500 hub catalog were built, which lines sit where, and how often they are replaced.",
};

export default function InventoryPage() {
  return <InventoryApp />;
}
