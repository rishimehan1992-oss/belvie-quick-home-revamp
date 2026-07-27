import Image from "next/image";
import Link from "next/link";
import { DEMO_TRANSFORMATIONS } from "@/lib/demo-transformations";

const heroDemo = DEMO_TRANSFORMATIONS[0];

export function ConversionHero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:py-16 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-medium text-saffron">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-pulse" />
            Pilot open · Bangalore only
          </div>

          <p className="mt-6 font-display text-5xl tracking-[0.04em] text-ink sm:text-6xl">
            Belvie
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight text-ink sm:text-3xl md:text-[2rem]">
            See your room transformed —{" "}
            <span className="text-saffron">before you spend a rupee</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Upload a photo. Get a makeover plan + before/after preview + Bangalore
            budget in 2 minutes. Revamp done in under 4 hours — you never leave
            home.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/revamp"
              className="bg-saffron px-8 py-4 text-center text-sm font-semibold tracking-wide text-paper shadow-lg shadow-saffron/25 transition-colors hover:bg-terracotta"
            >
              Preview my room →
            </Link>
            <p className="text-xs text-stone">
              No payment upfront · WhatsApp in 24h
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 border-t border-line pt-6 text-sm text-ink-soft">
            <div>
              <p className="font-display text-2xl text-ink">4 hrs</p>
              <p>Avg. revamp time</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink">₹25K+</p>
              <p>Budget bands from</p>
            </div>
            <div>
              <p className="font-display text-2xl text-ink">0</p>
              <p>Days shifting out</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={heroDemo.before.src}
                alt={heroDemo.before.alt}
                fill
                className="object-cover brightness-90 saturate-75"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              <span className="absolute left-2 top-2 bg-ink/75 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper">
                Before
              </span>
            </div>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={heroDemo.after.src}
                alt={heroDemo.after.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              <span className="absolute left-2 top-2 bg-saffron px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper">
                After
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-medium text-ink">
            {heroDemo.room} · {heroDemo.location} ·{" "}
            <span className="text-saffron">{heroDemo.budget}</span>
          </p>
          <a
            href="#examples"
            className="mt-1 block text-center text-xs text-stone underline-offset-2 hover:underline"
          >
            See more transformations ↓
          </a>
        </div>
      </div>
    </section>
  );
}
