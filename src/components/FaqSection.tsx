const FAQS = [
  {
    q: "Is the room vision really free?",
    a: "Yes. Upload your photo, answer a few questions, and get a full makeover plan with budget estimate — no payment needed.",
  },
  {
    q: "What does 'no room vacation' mean?",
    a: "You stay in your home during the revamp. We work around you — no shifting furniture to a relative's house or booking a hotel.",
  },
  {
    q: "How can a revamp finish in 4 hours?",
    a: "We focus on high-impact changes — decor, soft furnishings, lighting, styling — not full civil work. Most rooms are done same day.",
  },
  {
    q: "Do you work outside Bangalore?",
    a: "This pilot is Bangalore-only. We're starting in Koramangala, HSR, Indiranagar, Whitefield and nearby areas.",
  },
  {
    q: "What happens after I share my number?",
    a: "We WhatsApp you within 24 hours with the full item list, budget breakdown, and next steps if you want to proceed.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-paper px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">
          Questions
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-wide text-ink">
          Before you start
        </h2>

        <div className="mt-10 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group border border-line bg-paper open:bg-mist/30"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-saffron transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
