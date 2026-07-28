"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DemoTransformation } from "@/lib/demo-transformations";
import { applyStylingToImage } from "@/lib/same-image-revamp";
import { parseJsonResponse } from "@/lib/api";

type DemoRoomCompareProps = {
  demo: DemoTransformation;
  compact?: boolean;
};

export function DemoRoomCompare({ demo, compact = false }: DemoRoomCompareProps) {
  const [afterSrc, setAfterSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"flux" | "markup">("markup");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);

      try {
        const res = await fetch("/api/demo-flux", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            beforeImageUrl: demo.before.src,
            brief: demo.brief,
            vision: {
              roomStructure: demo.roomStructure,
              afterImageBrief: demo.afterImageBrief,
              keyChanges: demo.keyChanges,
              colorPalette: demo.colorPalette,
              primaryTheme: demo.room,
            },
          }),
        });

        if (res.ok) {
          const data = await parseJsonResponse<{ afterImageUrl?: string }>(res);
          if (!cancelled && data.afterImageUrl) {
            setAfterSrc(data.afterImageUrl);
            setMode("flux");
            setLoading(false);
            return;
          }
        }
      } catch {
        // fall through to markup
      }

      try {
        const url = await applyStylingToImage(demo.before.src, {
          colorPalette: demo.colorPalette,
          keyChanges: demo.keyChanges,
          roomType: demo.brief.roomType,
          primaryTheme: demo.room,
        });
        if (!cancelled) {
          setAfterSrc(url);
          setMode("markup");
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAfterSrc(demo.before.src);
          setLoading(false);
        }
      }
    }

    void run();

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
            <p className="text-xs">
              Generating FLUX.1 Kontext revamp…
            </p>
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
          {mode === "flux" ? "After Belvie" : "Planned changes"}
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-ink/70 px-2 py-1 text-[10px] text-paper/90">
          {mode === "flux"
            ? "FLUX.1 Kontext · same room edit"
            : "Plan markers · add Replicate token for photoreal after"}
        </span>
      </div>
    </div>
  );
}
