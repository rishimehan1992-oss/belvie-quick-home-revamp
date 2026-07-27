import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.04em] text-paper md:text-[1.65rem]"
        >
          Belvie
        </Link>
        <nav className="flex items-center gap-6 text-sm tracking-wide text-paper/85 md:gap-8">
          <a href="#why" className="hidden opacity-80 transition-opacity hover:opacity-100 sm:inline">
            Why Belvie
          </a>
          <a href="#how" className="opacity-80 transition-opacity hover:opacity-100">
            How it works
          </a>
          <Link
            href="/revamp"
            className="border border-paper/40 px-4 py-2 text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Begin
          </Link>
        </nav>
      </div>
    </header>
  );
}
