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
    `Photorealistic interior design photograph of a beautifully renovated ${room} in an Indian apartment in Bangalore.`,
    `Style: ${style}.`,
    vision.designDirection,
    `Color palette: ${vision.colorPalette.join(", ")}.`,
    `Key features: ${vision.keyChanges.slice(0, 4).join(", ")}.`,
    "Warm natural daylight, premium home decor, clean composition, wide angle, magazine quality, no people, no text.",
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
