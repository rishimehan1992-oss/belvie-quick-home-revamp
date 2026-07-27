import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";

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
- Photos uploaded: ${photoCount} (plan for a typical Bangalore ${labelFor(ROOM_TYPES, brief.roomType)})

Belvie USPs to weave in:
- No room vacation — customer stays at home during revamp
- Most revamps completed in under 4 hours
- Items and pricing for Bangalore (mention local markets/stores like IKEA Bangalore, Home Centre, Decathlon Home, local carpenters, upholstery vendors in areas like Indiranagar, Koramangala, HSR)

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

async function callDeepSeek(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    let message = raw;
    try {
      const err = JSON.parse(raw) as {
        error?: { message?: string };
      };
      message = err.error?.message ?? raw;
    } catch {
      // keep raw text
    }
    throw new Error(`DeepSeek error (${response.status}): ${message}`);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error("Invalid response from DeepSeek. Please try again.");
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from DeepSeek");
  }

  return content;
}

export async function analyzeRoom(
  brief: RevampBrief,
  photoCount = 0,
): Promise<RevampVision> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured on the server");
  }

  const prompt = buildPrompt(brief, photoCount);
  const content = await callDeepSeek(apiKey, prompt);
  return parseVision(content);
}
