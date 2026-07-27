"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  applyStylingToImage,
  type StylingOverlayConfig,
} from "@/lib/same-image-revamp";

type DemoRoomCompareProps = {
  beforeSrc: string;
  beforeAlt: string;
  afterAlt: string;
  styling: StylingOverlayConfig;
  compact?: boolean;
};

export function DemoRoomCompare({
  beforeSrc,
  beforeAlt,
  afterAlt,
  styling,
  compact = false,
}: DemoRoomCompareProps) {
  const [afterSrc, setAfterSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    applyStylingToImage(beforeSrc, styling)
      .then((url) => {
        if (!cancelled) {
          setAfterSrc(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAfterSrc(beforeSrc);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [beforeSrc, styling]);

  return (
    <div
      className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
    >
      <div
        className={`relative overflow-hidden bg-mist ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
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
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-sage-deep/90 text-paper">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-paper border-t-transparent" />
            <p className="text-xs">Applying styling…</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterSrc}
            alt={afterAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span className="absolute left-2 top-2 bg-saffron px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          After Belvie
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-ink/70 px-2 py-1 text-[10px] text-paper/90">
          Same room · styling edits only
        </span>
      </div>
    </div>
  );
}
