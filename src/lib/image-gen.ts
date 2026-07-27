import type { RevampBrief, RevampVision } from "./types";
import { DESIGN_STYLES, ROOM_TYPES } from "./constants";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function buildAfterImagePrompt(
  brief: RevampBrief,
  vision: RevampVision,
): string {
  const room = labelFor(ROOM_TYPES, brief.roomType);
  const style = labelFor(DESIGN_STYLES, brief.designStyle);

  return [
    `Photorealistic interior photograph of the exact same ${room} shown in the reference — identical room dimensions, same walls, windows, doors, ceiling height and furniture placement.`,
    `ONLY styling changes allowed: ${vision.keyChanges.slice(0, 4).join(", ")}.`,
    `Style: ${style}. Colors: ${vision.colorPalette.join(", ")}.`,
    vision.designDirection,
    "Do NOT change room layout, wall structure, window size, or floor plan. Decor, textiles, lighting and soft furnishings only.",
    "Natural daylight, realistic Indian apartment in Bangalore, achievable home styling, no luxury renovation, no people, no text.",
  ].join(" ");
}

export function buildAfterImageUrl(prompt: string): string {
  const params = new URLSearchParams({
    width: "1024",
    height: "768",
    nologo: "true",
    enhance: "true",
    model: "flux",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}
