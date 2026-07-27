import Image from "next/image";
import Link from "next/link";
import { DEMO_TRANSFORMATIONS } from "@/lib/demo-transformations";

export function DemoTransformations() {
  return (
    <section id="examples" className="bg-mist px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
            Real-style makeovers
          </p>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
            See what Belvie can do
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">
            Dull room in → stunning room out. Same-day revamps, Bangalore
            pricing — no shifting out.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {DEMO_TRANSFORMATIONS.map((demo) => (
            <article
              key={demo.id}
              className="border border-line bg-paper shadow-sm"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px]">
                  <Image
                    src={demo.before.src}
                    alt={demo.before.alt}
                    fill
                    className="object-cover brightness-90 saturate-75"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
                    Before
                  </span>
                  <span className="absolute bottom-3 left-3 bg-ink/70 px-2 py-1 text-xs text-paper/90">
                    Dated · Cluttered · Dull
                  </span>
                </div>
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px]">
                  <Image
                    src={demo.after.src}
                    alt={demo.after.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <span className="absolute left-3 top-3 bg-saffron px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
                    After Belvie
                  </span>
                  <span className="absolute bottom-3 left-3 bg-saffron/90 px-2 py-1 text-xs font-medium text-paper">
                    Styled · Fresh · Done in ~4 hrs
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">
                    {demo.room} · {demo.location}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{demo.budgetNote}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wider text-stone">
                    Approx. budget
                  </p>
                  <p className="font-display text-2xl text-saffron">
                    {demo.budget}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-ink-soft">
            Your room could be next — upload a photo and get your own plan.
          </p>
          <Link
            href="/revamp"
            className="mt-5 inline-block bg-saffron px-10 py-4 text-sm font-semibold text-paper transition-colors hover:bg-terracotta"
          >
            Preview my room →
          </Link>
        </div>
      </div>
    </section>
  );
}
