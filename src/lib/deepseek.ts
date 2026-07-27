import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

function buildPrompt(brief: RevampBrief) {
  const budget = BUDGET_BANDS.find((b) => b.id === brief.budgetBand);

  return `You are Belvie, a Bangalore-based quick home revamp consultant. A customer wants a room makeover.

Customer brief:
- Room type: ${labelFor(ROOM_TYPES, brief.roomType)}
- Design style: ${labelFor(DESIGN_STYLES, brief.designStyle)}
- Budget band: ${budget?.label ?? brief.budgetBand} (strict — total must stay within this range)
- Priority: ${labelFor(PRIORITIES, brief.priority)}
- When they want it: ${brief.timeline || "As soon as possible"}
- What needs revamp: ${brief.revampNotes || "Full room refresh"}

Belvie USPs to weave in:
- No room vacation — customer stays at home during revamp
- Most revamps completed in under 4 hours
- Items and pricing for Bangalore (mention local markets/stores like IKEA Bangalore, Home Centre, Decathlon Home, local carpenters, upholstery vendors in areas like Indiranagar, Koramangala, HSR)

Analyze the uploaded room photo(s) and return ONLY valid JSON (no markdown) in this exact shape:
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

  const parsed = JSON.parse(cleaned) as RevampVision;

  if (!parsed.visionSummary || !parsed.items?.length) {
    throw new Error("Incomplete vision response");
  }

  return parsed;
}

export async function analyzeRoom(
  brief: RevampBrief,
  images: string[],
): Promise<RevampVision> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const prompt = buildPrompt(brief);

  const imageParts = images.slice(0, 3).map((base64) => ({
    type: "image_url" as const,
    image_url: { url: base64 },
  }));

  const messages = [
    {
      role: "user" as const,
      content: [
        ...imageParts,
        { type: "text" as const, text: prompt },
      ],
    },
  ];

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();

    if (images.length > 0 && response.status === 400) {
      return analyzeRoomTextOnly(brief, apiKey);
    }

    throw new Error(`DeepSeek error: ${response.status} — ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from DeepSeek");
  }

  return parseVision(content);
}

async function analyzeRoomTextOnly(
  brief: RevampBrief,
  apiKey: string,
): Promise<RevampVision> {
  const prompt = `${buildPrompt(brief)}

Note: No room photo was available. Base your plan on typical Bangalore homes for the room type and customer notes.`;

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek text fallback failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from DeepSeek");
  }

  return parseVision(content);
}
