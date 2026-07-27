import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision } from "./types";

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5-20250929";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

function buildPrompt(brief: RevampBrief, photoCount: number) {
  const budget = BUDGET_BANDS.find((b) => b.id === brief.budgetBand);

  return `You are Belvie, a Bangalore-based quick home revamp consultant. A customer wants a room makeover.

Customer brief:
- Room type: ${labelFor(ROOM_TYPES, brief.roomType)}
- Design style: ${labelFor(DESIGN_STYLES, brief.designStyle)}
- Budget band: ${budget?.label ?? brief.budgetBand} (strict — total must stay within this range)
- Priority: ${labelFor(PRIORITIES, brief.priority)}
- When they want it: ${brief.timeline || "As soon as possible"}
- What needs revamp: ${brief.revampNotes || "Full room refresh"}
- Photos uploaded: ${photoCount}

Belvie USPs to weave in:
- No room vacation — customer stays at home during revamp
- Most revamps completed in under 4 hours
- STYLING ONLY — same room layout, walls, windows unchanged. No demolition, no civil work.
- Only add/change: decor, textiles, lighting, soft furnishings, organisers, wall art, curtains, sofa covers
- Items and pricing for Bangalore (IKEA Bangalore, Home Centre, local markets in Koramangala, HSR, Indiranagar)

${photoCount > 0 ? "Analyze the uploaded room photo(s). Describe what you see — layout, furniture, wall colour, lighting — then plan styling-only changes (wallpaper, panels, decor, textiles) that keep the exact same room shell." : "Plan for a typical Bangalore " + labelFor(ROOM_TYPES, brief.roomType) + "."}

keyChanges must list ONLY deliverable styling edits e.g. "add wallpaper on left wall", "wooden wall panels behind TV", "new sofa cushion covers", "add floor lamp" — NOT structural changes.

Return ONLY valid JSON (no markdown, no extra text) in this exact shape:
{
  "visionSummary": "2-3 sentence overview of the transformed room",
  "designDirection": "paragraph on style, materials, mood",
  "colorPalette": ["color 1", "color 2", "color 3"],
  "keyChanges": ["change 1", "change 2", "change 3", "change 4"],
  "items": [
    {
      "name": "item name",
      "estimatedCost": 5000,
      "whereToBuy": "store/market in Bangalore",
      "category": "furniture|decor|lighting|textiles|paint|storage|other"
    }
  ],
  "estimatedBudget": {
    "min": 30000,
    "max": 45000,
    "breakdown": "short explanation of how budget is split"
  },
  "timelineHours": 4,
  "bangaloreTip": "one practical local sourcing tip",
  "noVacationNote": "how revamp happens without customer leaving home"
}

Include 6-10 items. All costs in INR. estimatedBudget min/max must fit the customer's budget band.`;
}

function parseVision(content: string): RevampVision {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as RevampVision;
    if (!parsed.visionSummary || !parsed.items?.length) {
      throw new Error("Incomplete vision response");
    }
    return parsed;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Could not parse AI response. Please try again.");
    }

    const parsed = JSON.parse(match[0]) as RevampVision;
    if (!parsed.visionSummary || !parsed.items?.length) {
      throw new Error("Incomplete vision response");
    }
    return parsed;
  }
}

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
    .slice(0, 2)
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
      max_tokens: 2500,
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

  const prompt = buildPrompt(brief, images.length);
  const content = await callClaude(apiKey, prompt, images);
  return parseVision(content);
}
