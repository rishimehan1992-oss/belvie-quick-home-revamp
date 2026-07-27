"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DemoTransformation } from "@/lib/demo-transformations";
import { applyStylingToImage } from "@/lib/same-image-revamp";

type DemoRoomCompareProps = {
  demo: DemoTransformation;
  compact?: boolean;
};

export function DemoRoomCompare({ demo, compact = false }: DemoRoomCompareProps) {
  const [afterSrc, setAfterSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    applyStylingToImage(demo.before.src, {
      colorPalette: demo.colorPalette,
      keyChanges: demo.keyChanges,
      roomType: demo.brief.roomType,
      primaryTheme: demo.room,
    })
      .then((url) => {
        if (!cancelled) {
          setAfterSrc(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAfterSrc(demo.before.src);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [demo]);

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
        {loading || !afterSrc ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-ink/80 px-4 text-center text-paper">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-paper border-t-transparent" />
            <p className="text-xs">Marking revamp plan on your room…</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterSrc}
            alt={demo.afterAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span className="absolute left-2 top-2 bg-saffron px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          Planned changes
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-ink/70 px-2 py-1 text-[10px] text-paper/90">
          Same photo · numbered cosmetic plan (not a fake render)
        </span>
      </div>
    </div>
  );
}
