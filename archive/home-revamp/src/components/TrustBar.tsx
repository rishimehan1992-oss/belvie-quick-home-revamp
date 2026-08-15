import Link from "next/link";

const TRUST_ITEMS = [
  { icon: "⚡", label: "Under 4 hours" },
  { icon: "🏠", label: "No room vacation" },
  { icon: "📍", label: "Bangalore pricing" },
  { icon: "✓", label: "No upfront payment" },
];

export function TrustBar() {
  return (
    <section className="border-b border-line bg-paper py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 md:px-10">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-sm font-medium text-ink"
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </div>
        ))}
        <Link
          href="/revamp"
          className="hidden bg-saffron px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-terracotta md:inline-block"
        >
          Preview my room →
        </Link>
      </div>
    </section>
  );
}
