import type { RevampBrief, RevampVision, RoomStructure } from "./types";
import { DESIGN_STYLES, ROOM_TYPES } from "./constants";
import { imageEditPromptPrefix, sanitizeKeyChanges } from "./styling-rules";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function buildStructureAwarePrompt(
  brief: RevampBrief,
  vision: RevampVision,
): string {
  const room = labelFor(ROOM_TYPES, brief.roomType);
  const style = labelFor(DESIGN_STYLES, brief.designStyle);
  const structure = vision.roomStructure;
  const safeChanges = sanitizeKeyChanges(vision.keyChanges).slice(0, 6);

  const fixtureLock = structure.fixtures
    .map((f) => `${f.type} at ${f.position}: ${f.description}`)
    .join("; ");

  const furnitureLock = structure.existingFurniture
    .map((f) => `${f.item} at ${f.position} (${f.notes})`)
    .join("; ");

  return [
    imageEditPromptPrefix(),
    "Generate a NEW photorealistic photograph of the SAME room — not a filter on the reference.",
    `ROOM TYPE: ${room}. STYLE: ${style}.`,
    `ROOM SIZE & SHAPE (locked): ${structure.approximateDimensions}. Ceiling: ${structure.ceilingHeight}.`,
    `CAMERA (match reference photo ${structure.referencePhotoIndex + 1}): ${structure.cameraAngle}.`,
    `FLOOR (structure unchanged, rugs allowed on top): ${structure.floorType}.`,
    `WALLS (same positions, cosmetic only): ${structure.wallDescription}.`,
    `LIGHTING: ${structure.lightDirection}.`,
    `FIXTURES LOCKED — exact position, size, appearance: ${fixtureLock || "all doors, windows, fans, switches, built-ins stay exact"}.`,
    furnitureLock
      ? `EXISTING FURNITURE POSITIONS (may restyle covers/cushions only): ${furnitureLock}.`
      : "Keep existing furniture in same positions; may update cushions, covers, or styling.",
    `COSMETIC REVAMP TO APPLY: ${vision.afterImageBrief}`,
    `Specific changes: ${safeChanges.join("; ")}.`,
    `Colour palette: ${vision.colorPalette.join(", ")}.`,
    "Add: wallpaper, wall panels, area rug, curtains, cushions, plug-in lamps, wall art, plants, loose decor.",
    "Never move doors, windows, wardrobes, ceiling fan, switches, or change room dimensions.",
  ].join(" ");
}

function getJpegDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length - 8) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function fitDimensions(
  width: number,
  height: number,
  maxSide = 1024,
): { width: number; height: number } {
  const scale = maxSide / Math.max(width, height);
  if (scale >= 1) return { width, height };
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function buildPollinationsEditUrl(
  beforeImageUrl: string,
  prompt: string,
  width: number,
  height: number,
  strength = "0.24",
): string {
  const params = new URLSearchParams({
    model: "flux",
    width: String(width),
    height: String(height),
    nologo: "true",
    image: beforeImageUrl,
    strength,
    seed: "42",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

function dataUrlToBuffer(dataUrl: string): {
  buffer: Buffer;
  mime: string;
} {
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
    throw new Error("Could not upload room photo for revamped image");
  }

  const json = (await res.json()) as {
    status?: string;
    data?: { url?: string };
  };

  const url = json.data?.url;
  if (!url) throw new Error("Temp upload returned no URL");

  return toDirectTmpUrl(url);
}

async function uploadFromUrl(imageUrl: string): Promise<{
  publicUrl: string;
  width: number;
  height: number;
}> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Could not fetch source image");

  const buffer = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") ?? "image/jpeg";
  const dims = getJpegDimensions(buffer) ?? { width: 1024, height: 768 };
  const fitted = fitDimensions(dims.width, dims.height);

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mime }),
    "room.jpg",
  );

  const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form,
  });

  if (!uploadRes.ok) throw new Error("Could not upload source image");

  const json = (await uploadRes.json()) as {
    data?: { url?: string };
  };
  const url = json.data?.url;
  if (!url) throw new Error("Temp upload returned no URL");

  return {
    publicUrl: toDirectTmpUrl(url),
    width: fitted.width,
    height: fitted.height,
  };
}

/**
 * Uses room structure analysis + after brief to generate a new photorealistic
 * revamped image via img2img, preserving dimensions and fixture positions.
 */
export async function generateRevampedImageUrl(
  beforeDataUrl: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  const { buffer } = dataUrlToBuffer(beforeDataUrl);
  const dims = getJpegDimensions(buffer) ?? { width: 1024, height: 768 };
  const { width, height } = fitDimensions(dims.width, dims.height);

  const publicUrl = await uploadTempImage(beforeDataUrl);
  const prompt = buildStructureAwarePrompt(brief, vision);

  return buildPollinationsEditUrl(publicUrl, prompt, width, height, "0.24");
}

/** For homepage demos — structure hints + reference URL */
export async function generateDemoRevampedImageUrl(
  beforeImageUrl: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  const { publicUrl, width, height } = await uploadFromUrl(beforeImageUrl);
  const prompt = buildStructureAwarePrompt(brief, vision);
  return buildPollinationsEditUrl(publicUrl, prompt, width, height, "0.24");
}

export const defaultRoomStructure: RoomStructure = {
  approximateDimensions: "Typical Indian apartment room, proportions match reference",
  ceilingHeight: "~10 ft flat ceiling",
  cameraAngle: "Eye-level, match reference photo angle exactly",
  floorType: "Existing flooring unchanged",
  wallDescription: "Same wall positions and corners as reference",
  lightDirection: "Same natural light direction as reference",
  referencePhotoIndex: 0,
  fixtures: [
    {
      type: "doors and windows",
      position: "exact positions as reference photo",
      description: "do not move, resize, or replace",
    },
    {
      type: "ceiling fan and switches",
      position: "exact positions as reference",
      description: "must remain identical",
    },
  ],
  existingFurniture: [],
};
