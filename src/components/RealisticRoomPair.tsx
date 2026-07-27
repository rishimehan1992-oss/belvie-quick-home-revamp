import Image from "next/image";

type RealisticRoomPairProps = {
  image: string;
  alt: string;
  beforeCaption: string;
  afterCaption: string;
  compact?: boolean;
};

export function RealisticRoomPair({
  image,
  alt,
  beforeCaption,
  afterCaption,
  compact = false,
}: RealisticRoomPairProps) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      {/* Before — same photo, simulated unstyled state */}
      <div
        className={`relative overflow-hidden ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={image}
          alt={`${alt} — before styling`}
          fill
          className="object-cover brightness-[0.72] contrast-[0.92] saturate-[0.35] sepia-[0.12]"
          sizes={compact ? "50vw" : "(max-width: 640px) 100vw, 50vw"}
        />
        <div className="absolute inset-0 bg-stone-500/15" />
        <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          Before
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-ink/75 px-2 py-1.5 text-[11px] leading-snug text-paper/90">
          {beforeCaption}
        </span>
      </div>

      {/* After — same photo, deliverable styled result */}
      <div
        className={`relative overflow-hidden ${compact ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      >
        <Image
          src={image}
          alt={`${alt} — after Belvie styling`}
          fill
          className="object-cover"
          sizes={compact ? "50vw" : "(max-width: 640px) 100vw, 50vw"}
        />
        <span className="absolute left-2 top-2 bg-saffron px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper">
          After Belvie
        </span>
        <span className="absolute bottom-2 left-2 right-2 bg-saffron/90 px-2 py-1.5 text-[11px] leading-snug text-paper">
          {afterCaption}
        </span>
      </div>
    </div>
  );
}
