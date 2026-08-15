import { GrowthApp } from "@/components/GrowthApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belvie — Growth",
  description:
    "Scale from 100 orders a day in Bengaluru to 2,500 a day per city and 25,000 a day across five major metros and five next metros.",
};

export default function GrowthPage() {
  return <GrowthApp />;
}
