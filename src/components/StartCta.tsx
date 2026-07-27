import Link from "next/link";

export function StartCta() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-20 text-paper md:px-10 md:py-28">
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-display text-4xl tracking-[0.06em] md:text-5xl">
          Ready to see your room?
        </p>
        <p className="mx-auto mt-5 max-w-md text-paper/75">
          Free AI vision. Bangalore budget. Under 4 hours execution. No shifting
          out. What&apos;s stopping you?
        </p>
        <Link
          href="/revamp"
          className="mt-8 inline-block bg-saffron px-10 py-4 text-sm font-semibold text-paper transition-colors hover:bg-terracotta"
        >
          Get my free room vision →
        </Link>
        <p className="mt-4 text-xs text-paper/50">
          Pilot · Limited slots · WhatsApp follow-up in 24h
        </p>
      </div>
    </section>
  );
}
