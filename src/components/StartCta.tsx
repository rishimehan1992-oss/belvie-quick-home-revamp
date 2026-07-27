import Link from "next/link";

export function StartCta() {
  return (
    <section
      id="start"
      className="relative overflow-hidden bg-saffron px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-terracotta/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="font-display text-5xl tracking-[0.06em] md:text-6xl">
          Belvie
        </p>
        <h2 className="mt-6 max-w-lg text-2xl font-medium leading-snug tracking-tight md:text-3xl">
          Dekho aapka room kaisa ban sakta hai
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-paper/85">
          Ek photo se shuru karo. Plan pasand aaye toh number share karo — hum
          24 ghante ke andar WhatsApp karenge.
        </p>
        <div className="mt-10">
          <Link
            href="/revamp"
            className="inline-block bg-paper px-8 py-4 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-mist"
          >
            Abhi shuru karo →
          </Link>
        </div>
      </div>
    </section>
  );
}
