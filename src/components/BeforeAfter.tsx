"use client";

import { useState } from "react";

type BeforeAfterProps = {
  beforeSrc: string;
  afterSrc: string | null;
  afterLoading?: boolean;
};

export function BeforeAfter({ beforeSrc, afterSrc, afterLoading }: BeforeAfterProps) {
  const [slider, setSlider] = useState(50);

  return (
    <div className="overflow-hidden border border-line bg-ink">
      <div className="relative aspect-[4/3] w-full select-none">
        {/* After (full width, underneath) */}
        <div className="absolute inset-0 bg-mist">
          {afterLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-sage-deep/90 text-paper">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper border-t-transparent" />
              <p className="text-sm">Adding wallpaper, panels, carpet & furniture…</p>
            </div>
          ) : afterSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={afterSrc}
              alt="Your room with wallpaper, panels, carpet and furniture added"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              Revamped preview loading…
            </div>
          )}
        </div>

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${slider}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt="Your room before revamp"
            className="absolute inset-y-0 left-0 h-full max-w-none object-cover"
            style={{ width: `${(100 / slider) * 100}%` }}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute inset-y-0 z-10 w-1 bg-paper shadow-lg"
          style={{ left: `${slider}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-xs font-medium text-ink shadow-md">
            ↔
          </div>
        </div>

        <input
          type="range"
          min={5}
          max={95}
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          className="absolute inset-0 z-20 w-full cursor-ew-resize opacity-0"
          aria-label="Drag to compare before and after"
        />

        <span className="absolute left-3 top-3 bg-ink/70 px-2 py-1 text-xs font-medium text-paper">
          Before
        </span>
        <span className="absolute right-3 top-3 bg-saffron px-2 py-1 text-xs font-medium text-paper">
          After
        </span>
      </div>
      <p className="px-4 py-2 text-center text-xs text-stone bg-paper">
        Drag the slider — after shows wallpaper, wall panels, carpet & furniture on your exact room
      </p>
    </div>
  );
}
