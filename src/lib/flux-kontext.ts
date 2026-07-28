import Replicate from "replicate";
import type { RevampBrief, RevampVision } from "./types";
import { DESIGN_STYLES, ROOM_TYPES } from "./constants";
import { sanitizeKeyChanges } from "./styling-rules";

const MODEL = "black-forest-labs/flux-kontext-pro";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

/**
 * Short, instruction-style prompt for FLUX.1 Kontext.
 * Kontext works best with clear "keep X / change Y" language — not essay prompts.
 */
export function buildFluxKontextPrompt(
  brief: RevampBrief,
  vision: RevampVision,
): string {
  const room = labelFor(ROOM_TYPES, brief.roomType);
  const style = labelFor(DESIGN_STYLES, brief.designStyle);
  const changes = sanitizeKeyChanges(vision.keyChanges).slice(0, 5);
  const structure = vision.roomStructure;

  const keepBits = [
    "same camera angle and framing",
    "same room dimensions and perspective",
    "same doors, windows, window grills",
    "same built-in wardrobes/almirahs and cabinets",
    "same ceiling fan, switches, AC, fixed light fixtures",
    "same flooring structure (rugs may be added on top)",
  ];

  if (structure.fixtures?.length) {
    keepBits.push(
      ...structure.fixtures.slice(0, 4).map(
        (f) => `${f.type} at ${f.position} stays exact`,
      ),
    );
  }

  const changeBits =
    changes.length > 0
      ? changes.join("; ")
      : vision.afterImageBrief.slice(0, 280);

  return [
    `Edit this exact ${room} photograph.`,
    `Theme: ${vision.primaryTheme || style}.`,
    `KEEP UNCHANGED: ${keepBits.join("; ")}.`,
    `COSMETIC CHANGES ONLY: ${changeBits}.`,
    `Colours: ${vision.colorPalette.slice(0, 4).join(", ")}.`,
    "Photorealistic interior photo. No civil work, no layout change, no new doors or windows.",
  ].join(" ");
}

function outputToUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    if ("url" in output && typeof (output as { url: unknown }).url === "function") {
      return (output as { url: () => string }).url();
    }
    if ("href" in output && typeof (output as { href: unknown }).href === "string") {
      return (output as { href: string }).href;
    }
  }
  if (Array.isArray(output) && typeof output[0] === "string") {
    return output[0];
  }
  throw new Error("Unexpected Flux Kontext output format");
}

/**
 * Run FLUX.1 Kontext [pro] via Replicate to edit the room photo in place.
 * `inputImage` can be a public URL or a data:image/...;base64,... URI.
 */
export async function generateFluxKontextAfterImage(
  inputImage: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const replicate = new Replicate({ auth: token });
  const prompt = buildFluxKontextPrompt(brief, vision);

  const output = await replicate.run(MODEL, {
    input: {
      prompt,
      input_image: inputImage,
      aspect_ratio: "match_input_image",
      output_format: "jpg",
      safety_tolerance: 2,
      prompt_upsampling: false,
    },
  });

  return outputToUrl(output);
}

export function isFluxConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}
