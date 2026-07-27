import type { RevampBrief, RevampVision } from "./types";
import {
  buildStylistAgentPrompt,
  parseVisionJson,
} from "./stylist-agent";

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5-20250929";
const MAX_PHOTOS = 6;

type ClaudeContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        data: string;
      };
    };

function parseDataUrl(dataUrl: string): ClaudeContentBlock | null {
  const match = dataUrl.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) return null;

  const mediaType = match[1] as
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";
  const data = match[2];

  return {
    type: "image",
    source: { type: "base64", media_type: mediaType, data },
  };
}

async function callClaude(
  apiKey: string,
  prompt: string,
  images: string[],
): Promise<string> {
  const imageBlocks = images
    .slice(0, MAX_PHOTOS)
    .map(parseDataUrl)
    .filter((b): b is ClaudeContentBlock => b !== null);

  const content: ClaudeContentBlock[] = [
    ...imageBlocks,
    { type: "text", text: prompt },
  ];

  const response = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content }],
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    let message = raw;
    try {
      const err = JSON.parse(raw) as { error?: { message?: string } };
      message = err.error?.message ?? raw;
    } catch {
      // keep raw text
    }
    throw new Error(`Claude error (${response.status}): ${message}`);
  }

  let data: { content?: { type: string; text?: string }[] };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error("Invalid response from Claude. Please try again.");
  }

  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Empty response from Claude");
  }

  return text;
}

export async function analyzeRoom(
  brief: RevampBrief,
  images: string[] = [],
): Promise<RevampVision> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured on the server");
  }

  const prompt = buildStylistAgentPrompt(brief, images.length, images.length > 0);
  const content = await callClaude(apiKey, prompt, images);
  return parseVisionJson(content);
}
