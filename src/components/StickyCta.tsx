"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 p-4 backdrop-blur-md md:hidden">
      <Link
        href="/revamp"
        className="block w-full bg-saffron py-3.5 text-center text-sm font-semibold text-paper"
      >
        Get free room vision →
      </Link>
    </div>
  );
}
