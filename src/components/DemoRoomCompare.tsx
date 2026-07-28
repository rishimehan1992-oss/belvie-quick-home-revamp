"use client";

import Image from "next/image";
import type { DemoTransformation } from "@/lib/demo-transformations";

type DemoRoomCompareProps = {
  demo: DemoTransformation;
  compact?: boolean;
};

export function DemoRoomCompare({ demo, compact = false }: DemoRoomCompareProps) {
  return (
    <div
      className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
    >
      <div
        className={`relative overflow-hidden bg-mist ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={demo.before.src}
          alt={demo.before.alt}
          fill
          className="object-cover"
          sizes={compact ? "50vw" : "(max-width: 640px) 100vw, 50vw"}
        />
        <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          Before
        </span>
      </div>

      <div
        className={`relative overflow-hidden bg-mist ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={demo.after.src}
          alt={demo.after.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 bg-saffron px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          After Belvie
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-ink/70 px-2 py-1 text-[10px] text-paper/90">
          FLUX.1 Kontext · same room edit
        </span>
      </div>
    </div>
  );
}
