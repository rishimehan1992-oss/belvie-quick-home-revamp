export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.04em] text-ink">
            Belvie
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Quick Home Revamp · Made in Bangalore 🇮🇳
          </p>
        </div>
        <p className="text-xs tracking-wide text-stone">
          © {new Date().getFullYear()} Belvie. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
