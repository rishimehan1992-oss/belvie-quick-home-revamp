import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden grain">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80"
          alt="Warm Indian living room with natural light and elegant decor"
          fill
          priority
          className="object-cover animate-ken"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/50 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <p className="animate-fade-up delay-1 text-xs font-medium uppercase tracking-[0.28em] text-saffron-light">
            Bangalore · Quick Home Revamp
          </p>
          <p className="animate-fade-up delay-1 font-display text-5xl leading-none tracking-[0.06em] text-paper sm:text-6xl md:text-7xl lg:text-8xl">
            Belvie
          </p>
          <h1 className="animate-fade-up delay-2 mt-5 max-w-xl font-sans text-xl font-medium leading-snug tracking-tight text-paper sm:text-2xl md:mt-6 md:text-[1.75rem]">
            Your room, refreshed — without shifting out.
          </h1>
          <p className="animate-fade-up delay-3 mt-4 max-w-lg text-base leading-relaxed text-paper/85 md:text-lg">
            Upload a photo. Get a complete makeover vision with Bangalore pricing.
            We revamp in under 4 hours — you stay home.
          </p>
          <div className="animate-fade-up delay-4 mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/revamp"
              className="bg-saffron px-7 py-3.5 text-sm font-medium tracking-wide text-paper transition-colors hover:bg-terracotta"
            >
              Start your revamp
            </Link>
            <a
              href="#why"
              className="px-2 py-3.5 text-sm tracking-wide text-paper/85 underline-offset-4 transition-colors hover:text-paper hover:underline"
            >
              Why Belvie
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
