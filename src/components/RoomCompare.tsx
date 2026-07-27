import Image from "next/image";

type RoomCompareProps = {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
  compact?: boolean;
};

export function RoomCompare({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  compact = false,
}: RoomCompareProps) {
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
          unoptimized={beforeSrc.includes("pollinations.ai")}
        />
        <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          Before
        </span>
      </div>

      <div
        className={`relative overflow-hidden bg-mist ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className="object-cover"
          sizes={compact ? "50vw" : "(max-width: 640px) 100vw, 50vw"}
          unoptimized={afterSrc.includes("pollinations.ai")}
        />
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
