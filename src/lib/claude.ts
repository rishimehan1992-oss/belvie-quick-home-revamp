import type { RevampBrief, RevampVision } from "./types";
import {
  buildStylistAgentPrompt,
  normalizeVision,
  parseVisionJson,
} from "./stylist-agent";
import { SUBMIT_REVAMP_PLAN_TOOL } from "./vision-schema";

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
/**
 * Haiku first for speed (target <30s on Vercel), then Sonnet if Haiku fails.
 */
const MODEL_CANDIDATES = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-5-20250929",
] as const;
const MAX_PHOTOS = 1;

type ClaudeMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

type ClaudeContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: ClaudeMediaType;
        data: string;
      };
    };

function normalizeMediaType(raw: string): ClaudeMediaType | null {
  const lower = raw.toLowerCase();
  if (lower === "image/jpg" || lower === "image/jpeg") return "image/jpeg";
  if (lower === "image/png") return "image/png";
  if (lower === "image/webp") return "image/webp";
  if (lower === "image/gif") return "image/gif";
  return null;
}

function parseDataUrl(dataUrl: string): ClaudeContentBlock | null {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mediaType = normalizeMediaType(match[1]);
  if (!mediaType) return null;

  // ~500KB base64 ≈ ~375KB binary — keep Claude + Vercel fast
  if (match[2].length > 700_000) return null;

  return {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: match[2] },
  };
}

function extractErrorMessage(raw: string, status: number): string {
  try {
    const err = JSON.parse(raw) as {
      error?: { message?: string; type?: string };
    };
    return err.error?.message ?? raw;
  } catch {
    return raw || `HTTP ${status}`;
  }
}

async function callClaudeOnce(
  apiKey: string,
  model: string,
  prompt: string,
  imageBlocks: ClaudeContentBlock[],
): Promise<RevampVision> {
  const content: ClaudeContentBlock[] = [
    ...imageBlocks,
    {
      type: "text",
      text:
        prompt +
        "\n\nCall submit_revamp_plan with the full plan. Keep string fields short. Do not write freeform JSON outside the tool.",
    },
  ];

  const response = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4500,
      tools: [SUBMIT_REVAMP_PLAN_TOOL],
      tool_choice: {
        type: "tool",
        name: "submit_revamp_plan",
      },
      messages: [{ role: "user", content }],
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Claude error (${response.status}): ${extractErrorMessage(raw, response.status)}`,
    );
  }

  let data: {
    content?: {
      type: string;
      text?: string;
      name?: string;
      input?: Partial<RevampVision>;
    }[];
    stop_reason?: string;
  };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error("Invalid response from Claude. Please try again.");
  }

  if (data.stop_reason === "max_tokens") {
    console.warn("[claude] response truncated at max_tokens");
  }

  const toolBlock = data.content?.find(
    (block) =>
      block.type === "tool_use" && block.name === "submit_revamp_plan",
  );

  if (toolBlock?.input && typeof toolBlock.input === "object") {
    return normalizeVision(toolBlock.input);
  }

  // Rare fallback if model returned text JSON instead of tool_use
  const text = data.content?.find((block) => block.type === "text")?.text;
  if (text) {
    return parseVisionJson(text);
  }

  throw new Error("Empty response from Claude");
}

async function callClaude(
  apiKey: string,
  prompt: string,
  images: string[],
): Promise<RevampVision> {
  const imageBlocks = images
    .slice(0, MAX_PHOTOS)
    .map(parseDataUrl)
    .filter((b): b is ClaudeContentBlock => b !== null);

  let lastError: Error | null = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      return await callClaudeOnce(apiKey, model, prompt, imageBlocks);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const msg = lastError.message;
      const tryNext =
        msg.includes("(404)") ||
        msg.includes("not_found") ||
        msg.includes("model:") ||
        msg.includes("invalid model") ||
        msg.includes("(529)") ||
        msg.includes("overloaded");
      if (!tryNext) throw lastError;
      console.warn(`[claude] model ${model} failed, trying next:`, msg);
    }
  }

  throw lastError ?? new Error("Claude request failed");
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
  return callClaude(apiKey, prompt, images);
}

export function isClaudeFallbackableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("credit balance") ||
    m.includes("billing") ||
    m.includes("rate_limit") ||
    m.includes("rate limit") ||
    m.includes("overloaded") ||
    m.includes("529") ||
    m.includes("503") ||
    m.includes("401") ||
    m.includes("authentication") ||
    m.includes("invalid x-api-key") ||
    m.includes("permission")
  );
}
