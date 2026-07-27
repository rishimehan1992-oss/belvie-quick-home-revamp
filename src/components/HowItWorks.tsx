const steps = [
  {
    num: "01",
    title: "Photo bhejo",
    body: "Upload 1–3 clear photos of your room — hall, bedroom, study, anything.",
  },
  {
    num: "02",
    title: "Brief share karo",
    body: "Room type, design style, budget band, and what needs changing — 5 minutes max.",
  },
  {
    num: "03",
    title: "Vision mil jayega",
    body: "Complete makeover plan with Bangalore item list and estimated budget.",
  },
  {
    num: "04",
    title: "Hum call karenge",
    body: "Like the plan? Share your number — we WhatsApp you within 24 hours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-paper px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
          Kaise kaam karta hai
        </p>
        <h2 className="mt-4 max-w-lg font-display text-4xl tracking-wide text-ink md:text-5xl">
          Photo se plan tak
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
          Simple, guided, and made for busy Bangalore households — no interior
          designer appointments needed to get started.
        </p>

        <ol className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.num} className="flex flex-col">
              <span className="font-display text-3xl tracking-wider text-saffron/60">
                {step.num}
              </span>
              <h3 className="mt-5 text-lg font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
