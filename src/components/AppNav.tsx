"use client";

import Link from "next/link";

const TABS = [
  { id: "pnl" as const, href: "/", n: "1", label: "P&L" },
  { id: "network" as const, href: "/network", n: "2", label: "Network" },
  { id: "sensitivity" as const, href: "/sensitivity", n: "3", label: "Sensitivity" },
  { id: "favorable" as const, href: "/favorable", n: "4", label: "Favorable" },
  { id: "growth" as const, href: "/growth", n: "5", label: "Growth" },
  { id: "inventory" as const, href: "/inventory", n: "6", label: "Inventory" },
  { id: "lifestyle" as const, href: "/lifestyle", n: "7", label: "Lifestyle" },
  { id: "simulate" as const, href: "/simulate", n: "8", label: "Simulate" },
  { id: "glossary" as const, href: "/glossary", n: "9", label: "Line items" },
];

export function AppNav({
  active,
}: {
  active:
    | "network"
    | "pnl"
    | "sensitivity"
    | "favorable"
    | "growth"
    | "inventory"
    | "lifestyle"
    | "simulate"
    | "glossary";
}) {
  const tab =
    "rounded-full border px-3 py-1.5 text-[12.5px] no-underline transition-colors";
  const on = "border-charcoal bg-charcoal text-white";
  const off = "border-line bg-white text-gray hover:border-terracotta hover:text-terracotta";

  return (
    <nav className="flex flex-wrap items-center gap-1.5" aria-label="Model views">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={`${tab} ${active === t.id ? on : off}`}
        >
          <span className={active === t.id ? "text-delivery" : "text-terracotta"}>{t.n} · </span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
