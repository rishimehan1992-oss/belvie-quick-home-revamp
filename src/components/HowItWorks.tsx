import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "Upload photo",
    body: "30 seconds. Any room — hall, bedroom, study.",
  },
  {
    num: "2",
    title: "Answer 5 questions",
    body: "Room type, style, budget band, what to change.",
  },
  {
    num: "3",
    title: "See before & after",
    body: "Before/after preview + budget + item list for Bangalore.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-paper px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
            2 minutes to your makeover plan
          </p>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-ink md:text-5xl">
            How it works
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.num}
              className="relative border border-line bg-mist/30 p-8 text-center"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center bg-saffron text-sm font-bold text-paper">
                {step.num}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link
            href="/revamp"
            className="inline-block bg-saffron px-10 py-4 text-sm font-semibold text-paper transition-colors hover:bg-terracotta"
          >
            Start now — it&apos;s free →
          </Link>
        </div>
      </div>
    </section>
  );
}
