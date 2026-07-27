import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision } from "./types";
import {
  sanitizeKeyChanges,
  stylingRulesPromptBlock,
} from "./styling-rules";

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

  return `You are Belvie, a Bangalore-based quick home revamp consultant.

Customer brief:
- Room type: ${labelFor(ROOM_TYPES, brief.roomType)}
- Design style: ${labelFor(DESIGN_STYLES, brief.designStyle)}
- Budget band: ${budget?.label ?? brief.budgetBand}
- Priority: ${labelFor(PRIORITIES, brief.priority)}
- Timeline: ${brief.timeline || "As soon as possible"}
- Needs revamp: ${brief.revampNotes || "Full styling refresh"}
- Photos: ${photoCount}

STYLING ONLY — preserve all doors, wall alignment, cabinets, windows, floor plan.
${stylingRulesPromptBlock()}
Items and pricing for Bangalore markets.

Return ONLY valid JSON:
{
  "visionSummary": "2-3 sentences",
  "designDirection": "paragraph",
  "colorPalette": ["color1", "color2", "color3"],
  "keyChanges": ["wallpaper on accent wall", "wooden panels behind TV", "new cushions", "floor lamp"],
  "items": [{"name": "item", "estimatedCost": 5000, "whereToBuy": "Bangalore store", "category": "decor"}],
  "estimatedBudget": {"min": 30000, "max": 45000, "breakdown": "split"},
  "timelineHours": 4,
  "bangaloreTip": "tip",
  "noVacationNote": "note"
}

6-10 items. INR only. Budget within customer's band.`;
}

function parseVision(content: string): RevampVision {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const tryParse = (text: string) => {
    const parsed = JSON.parse(text) as RevampVision;
    if (!parsed.visionSummary || !parsed.items?.length) {
      throw new Error("Incomplete vision response");
    }
    return parsed;
  };

  try {
    return tryParse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response");
    return tryParse(match[0]);
  }
}

export async function analyzeRoomWithDeepSeek(
  brief: RevampBrief,
  photoCount: number,
): Promise<RevampVision> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: buildPrompt(brief, photoCount) }],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`DeepSeek error (${response.status}): ${raw}`);
  }

  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty DeepSeek response");

  const vision = parseVision(content);
  vision.keyChanges = sanitizeKeyChanges(vision.keyChanges);
  return vision;
}
