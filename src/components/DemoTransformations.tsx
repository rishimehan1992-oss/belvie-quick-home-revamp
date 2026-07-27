import Link from "next/link";
import { DEMO_TRANSFORMATIONS } from "@/lib/demo-transformations";
import { RealisticRoomPair } from "@/components/RealisticRoomPair";

export function DemoTransformations() {
  return (
    <section id="examples" className="bg-mist px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
            What we actually deliver
          </p>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
            Same room. Better styling.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            No demolition, no layout change. We keep your walls, windows & furniture
            frame — and add decor, textiles, lighting & storage. Done in ~4 hours.
          </p>
        </div>

        <div className="mt-14 space-y-14">
          {DEMO_TRANSFORMATIONS.map((demo) => (
            <article
              key={demo.id}
              className="border border-line bg-paper shadow-sm"
            >
              <RealisticRoomPair
                image={demo.image}
                alt={demo.alt}
                beforeCaption={demo.beforeCaption}
                afterCaption={demo.afterCaption}
              />

              <div className="grid gap-6 border-t border-line px-5 py-6 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-sage">
                    Room
                  </p>
                  <p className="mt-1 font-medium text-ink">
                    {demo.room} · {demo.location}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-sage">
                    Unchanged
                  </p>
                  <ul className="mt-2 space-y-1">
                    {demo.unchanged.map((item) => (
                      <li key={item} className="text-sm text-ink-soft">
                        ✓ {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-sage">
                    What Belvie adds
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {demo.itemsAdded.map((item) => (
                      <li key={item} className="text-sm text-ink">
                        + {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-sage">
                    Total styling budget
                  </p>
                  <p className="mt-1 font-display text-3xl text-saffron">
                    {demo.budget}
                  </p>
                  <p className="mt-2 text-xs text-stone">
                    Incl. sourcing from Bangalore markets
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-stone">
          Before previews are simulated from the same room photo to show typical
          unstyled state. After shows the deliverable styling result.
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/revamp"
            className="inline-block bg-saffron px-10 py-4 text-sm font-semibold text-paper transition-colors hover:bg-terracotta"
          >
            Preview my room →
          </Link>
        </div>
      </div>
    </section>
  );
}
