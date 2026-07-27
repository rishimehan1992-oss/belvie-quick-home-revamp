import Link from "next/link";
import { USPS } from "@/lib/constants";

const icons: Record<string, string> = {
  home: "🏠",
  clock: "⚡",
  pin: "📍",
  rupee: "₹",
};

export function UspSection() {
  return (
    <section id="why" className="border-y border-line bg-sage-deep px-6 py-16 text-paper md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-saffron-light">
              Why Belvie wins
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl tracking-wide md:text-4xl">
              Not another interior designer quote
            </h2>
          </div>
          <Link
            href="/revamp"
            className="hidden border border-paper/40 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paper hover:text-ink md:inline-block"
          >
            Try it free →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((usp) => (
            <div
              key={usp.title}
              className="border border-paper/15 bg-paper/5 p-5"
            >
              <span className="text-xl" aria-hidden>
                {icons[usp.icon]}
              </span>
              <h3 className="mt-3 font-medium">{usp.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">
                {usp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
