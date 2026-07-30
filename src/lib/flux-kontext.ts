import Replicate from "replicate";
import type { RevampBrief, RevampVision } from "./types";
import { DESIGN_STYLES, ROOM_TYPES } from "./constants";
import { sanitizeKeyChanges } from "./styling-rules";

const MODEL = "black-forest-labs/flux-kontext-pro";
/** Soft cap ~120KB binary ≈ ~160KB base64 — keeps Replicate create under a few seconds */
const MAX_DATA_URI_CHARS = 220_000;

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

/**
 * Short instruction prompt — Kontext responds best to keep/change language.
 */
export function buildFluxKontextPrompt(
  brief: RevampBrief,
  vision: RevampVision,
): string {
  const room = labelFor(ROOM_TYPES, brief.roomType);
  const style = labelFor(DESIGN_STYLES, brief.designStyle);
  const changes = sanitizeKeyChanges(vision.keyChanges).slice(0, 4);
  const structure = vision.roomStructure;

  const fixtures = (structure.fixtures ?? [])
    .slice(0, 3)
    .map((f) => `${f.type} (${f.position})`)
    .join(", ");

  const changeBits =
    changes.length > 0
      ? changes.join("; ")
      : (vision.afterImageBrief || "add wallpaper, rug, cushions, lamp").slice(
          0,
          200,
        );

  return [
    `Edit this exact ${room} photo. Theme: ${vision.primaryTheme || style}.`,
    `KEEP: same camera angle, room shape, doors, windows, built-ins, ceiling fan/fixtures${fixtures ? `, especially ${fixtures}` : ""}.`,
    `CHANGE ONLY: ${changeBits}. Palette: ${vision.colorPalette.slice(0, 3).join(", ")}.`,
    "Photorealistic interior. No civil work, no layout change.",
  ].join(" ");
}

function outputToUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (output && typeof output === "object") {
    if (
      "url" in output &&
      typeof (output as { url: unknown }).url === "function"
    ) {
      return (output as { url: () => string }).url();
    }
    if (
      "href" in output &&
      typeof (output as { href: unknown }).href === "string"
    ) {
      return (output as { href: string }).href;
    }
  }
  if (Array.isArray(output) && typeof output[0] === "string") {
    return output[0];
  }
  throw new Error("Unexpected image output format");
}

function assertUsableInputImage(inputImage: string) {
  if (inputImage.startsWith("data:")) {
    if (inputImage.length > MAX_DATA_URI_CHARS) {
      throw new Error(
        "Room photo is too large for fast preview. Please re-upload a clearer, smaller photo.",
      );
    }
    return;
  }
  if (!/^https?:\/\//i.test(inputImage)) {
    throw new Error("Invalid room photo for preview generation");
  }
}

function getReplicateClient(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }
  return new Replicate({ auth: token });
}

/**
 * Run image edit synchronously (used by demos / scripts).
 */
export async function generateFluxKontextAfterImage(
  inputImage: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  assertUsableInputImage(inputImage);
  const replicate = getReplicateClient();
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

export type AfterImagePredictionStatus = {
  id: string;
  status:
    | "starting"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled"
    | "unknown";
  outputUrl?: string;
  error?: string;
};

export async function startAfterImagePrediction(
  inputImage: string,
  brief: RevampBrief,
  vision: RevampVision,
): Promise<string> {
  assertUsableInputImage(inputImage);
  const replicate = getReplicateClient();
  const prompt = buildFluxKontextPrompt(brief, vision);

  const prediction = await replicate.predictions.create({
    model: MODEL,
    input: {
      prompt,
      input_image: inputImage,
      aspect_ratio: "match_input_image",
      output_format: "jpg",
      safety_tolerance: 2,
      prompt_upsampling: false,
    },
  });

  if (!prediction?.id) {
    throw new Error("Image service did not return a prediction id");
  }

  return prediction.id;
}

export async function getAfterImagePredictionStatus(
  predictionId: string,
): Promise<AfterImagePredictionStatus> {
  const replicate = getReplicateClient();
  const prediction = await replicate.predictions.get(predictionId);

  if (prediction.status === "succeeded") {
    try {
      return {
        id: prediction.id,
        status: "succeeded",
        outputUrl: outputToUrl(prediction.output),
      };
    } catch {
      return {
        id: prediction.id,
        status: "failed",
        error: "Image output format was invalid",
      };
    }
  }

  return {
    id: prediction.id,
    status:
      prediction.status === "starting" ||
      prediction.status === "processing" ||
      prediction.status === "failed" ||
      prediction.status === "canceled"
        ? prediction.status
        : "unknown",
    error: typeof prediction.error === "string" ? prediction.error : undefined,
  };
}

export function isFluxConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}
