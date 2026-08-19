import { InventoryApp } from "@/components/InventoryApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Inventory",
  description:
    "BPC colour cosmetics: 850 fast-moving spoke SKUs inside 800–900, 1,250 catalog inside 1,200–1,300.",
};

export default function InventoryPage() {
  return <InventoryApp />;
}
