import Link from "next/link";
import { BUDGET_BANDS } from "@/lib/constants";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-mist px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
          Transparent pricing
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
          Pick your budget band
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink-soft">
          No hidden costs. Tell us your range upfront — we plan everything
          within it. Bangalore-sourced items only.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BUDGET_BANDS.map((band, i) => (
            <div
              key={band.id}
              className={`border bg-paper p-6 text-left transition-shadow hover:shadow-md ${
                i === 1 ? "border-saffron ring-2 ring-saffron/20" : "border-line"
              }`}
            >
              {i === 1 ? (
                <span className="text-xs font-medium uppercase tracking-wider text-saffron">
                  Most popular
                </span>
              ) : (
                <span className="text-xs text-stone">&nbsp;</span>
              )}
              <p className="mt-2 font-display text-2xl text-ink">{band.label}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Decor, soft furnishings & styling
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/revamp"
          className="mt-10 inline-block bg-saffron px-8 py-4 text-sm font-semibold text-paper transition-colors hover:bg-terracotta"
        >
          Start with free vision →
        </Link>
      </div>
    </section>
  );
}
