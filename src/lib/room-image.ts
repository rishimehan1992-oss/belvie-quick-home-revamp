import type { RevampBrief, RevampVision } from "./types";
import { DESIGN_STYLES, ROOM_TYPES } from "./constants";
import {
  imageEditPromptPrefix,
  sanitizeKeyChanges,
  stylingRulesPromptBlock,
} from "./styling-rules";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function buildStylingEditPrompt(
  brief: RevampBrief,
  vision: RevampVision,
): string {
  const room = labelFor(ROOM_TYPES, brief.roomType);
  const style = labelFor(DESIGN_STYLES, brief.designStyle);
  const safeChanges = sanitizeKeyChanges(vision.keyChanges).slice(0, 5);

  return [
    imageEditPromptPrefix(),
    `Room type: ${room}.`,
    `Apply ONLY these styling layers: ${safeChanges.join("; ")}.`,
    `Style: ${style}. Colours: ${vision.colorPalette.join(", ")}.`,
    "Add only: wallpaper, carpet, cushions, curtains, lamps, wall art, small extra furniture pieces.",
    "Do not alter doors, walls, cabinets, windows, or alignment.",
  ].join(" ");
}

export function buildPollinationsEditUrl(
  beforeImageUrl: string,
  prompt: string,
): string {
  const params = new URLSearchParams({
    model: "flux",
    width: "1024",
    height: "768",
    nologo: "true",
    image: beforeImageUrl,
    // Lower strength = preserve more of original structure
    strength: "0.35",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = dataUrl.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function toDirectTmpUrl(url: string): string {
  return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function uploadTempImage(dataUrl: string): Promise<string> {
  const { buffer, mime } = dataUrlToBuffer(dataUrl);
  const ext = mime.split("/")[1] || "jpg";

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mime }),
    `room.${ext}`,
  );

  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Could not upload room photo for styling preview");
  }

  const json = (await res.json()) as {
    status?: string;
    data?: { url?: string };
  };

  const url = json.data?.url;
  if (!url) throw new Error("Temp upload returned no URL");

  return toDirectTmpUrl(url);
}

export async function generateAfterImageUrl(
  beforeDataUrl: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  const publicUrl = await uploadTempImage(beforeDataUrl);
  const prompt = buildStylingEditPrompt(brief, vision);
  return buildPollinationsEditUrl(publicUrl, prompt);
}

export function generateDemoAfterUrl(
  beforeImageUrl: string,
  prompt: string,
): string {
  return buildPollinationsEditUrl(beforeImageUrl, prompt);
}
