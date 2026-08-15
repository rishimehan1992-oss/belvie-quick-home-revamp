import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.04em] text-ink"
        >
          Belvie
        </Link>
        <nav className="flex items-center gap-4 text-sm md:gap-6">
          <a
            href="#examples"
            className="hidden text-ink-soft transition-colors hover:text-ink sm:inline"
          >
            Examples
          </a>
          <a
            href="#pricing"
            className="hidden text-ink-soft transition-colors hover:text-ink sm:inline"
          >
            Pricing
          </a>
          <Link
            href="/revamp"
            className="bg-saffron px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-terracotta md:px-5"
          >
            Preview my room →
          </Link>
        </nav>
      </div>
    </header>
  );
}
