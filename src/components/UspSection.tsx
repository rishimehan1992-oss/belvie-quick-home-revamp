import { USPS } from "@/lib/constants";

const icons: Record<string, string> = {
  home: "🏠",
  clock: "⚡",
  pin: "📍",
  rupee: "₹",
};

export function UspSection() {
  return (
    <section id="why" className="bg-sage-deep px-6 py-24 text-paper md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-saffron-light">
          Why Belvie
        </p>
        <h2 className="mt-4 max-w-xl font-display text-4xl tracking-wide md:text-5xl">
          Built for Indian homes, Bangalore pace
        </h2>
        <p className="mt-5 max-w-lg text-paper/75">
          No month-long renovations. No packing up and moving to a relative&apos;s
          house. Belvie is quick, clean, and designed around how we actually live.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((usp) => (
            <div
              key={usp.title}
              className="border border-paper/15 bg-paper/5 p-6 backdrop-blur-sm"
            >
              <span className="text-2xl" aria-hidden>
                {icons[usp.icon]}
              </span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">
                {usp.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                {usp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
