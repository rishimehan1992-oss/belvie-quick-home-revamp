"use client";

import Link from "next/link";

export function AppNav({ active }: { active: "network" | "pnl" }) {
  const tab =
    "rounded-full border px-3 py-1.5 text-[12.5px] no-underline transition-colors";
  const on = "border-charcoal bg-charcoal text-white";
  const off = "border-line bg-white text-gray hover:border-terracotta hover:text-terracotta";

  return (
    <nav className="flex flex-wrap items-center gap-1.5" aria-label="Model views">
      <Link href="/" className={`${tab} ${active === "network" ? on : off}`}>
        Network cost
      </Link>
      <Link href="/pnl" className={`${tab} ${active === "pnl" ? on : off}`}>
        P&L
      </Link>
    </nav>
  );
}
