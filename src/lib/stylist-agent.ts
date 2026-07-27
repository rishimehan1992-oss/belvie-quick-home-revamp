import {
  BUDGET_BANDS,
  DESIGN_STYLES,
  PRIORITIES,
  ROOM_TYPES,
} from "./constants";
import type { RevampBrief, RevampVision, RoomStructure } from "./types";
import { sanitizeKeyChanges } from "./styling-rules";

export const defaultRoomStructure: RoomStructure = {
  approximateDimensions:
    "Typical Indian apartment room, proportions match reference",
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

function labelFor<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export const STYLIST_AGENT_ROLE = `You are an expert interior stylist and renovation cost estimator specializing in Indian homes (Bengaluru market pricing). You will receive multiple photographs of a room (or several rooms). Your job is to propose a cosmetic makeover, describe a photorealistic "after" vision of the same room, and provide an itemized cost estimate in INR.

Study all photos carefully before responding to understand:
- Exact room dimensions and proportions (infer from photos; do not alter)
- Position of windows, doors, built-in wardrobes/almirahs, electrical points, switches, fans, and light fixtures
- Existing flooring, wall color, furniture, and decor
- Natural light direction and quantity

HARD CONSTRAINTS — NEVER VIOLATE THESE:
- Do NOT change room dimensions, proportions, or perspective. The after vision must show the exact same room — same size, same ceiling height, same layout footprint.
- Do NOT modify, move, add, or remove any structural element: walls, doors, door frames, windows, window grills, built-in almirahs/wardrobes, ceiling, flooring structure, columns, or beams.
- Do NOT change any fixtures: ceiling fans, light fixtures, switchboards, sockets, AC units, geysers, taps, or plumbing. They must stay in the exact same position.
- Do NOT suggest civil work — no demolition, no false ceiling, no tile replacement, no plumbing or electrical rework, no painting that requires wall repair.
- The after vision must match one uploaded photo angle as closely as possible for before/after comparison.

WHAT YOU MAY CHANGE (cosmetic layer only):
- Wallpaper or peel-and-stick wall coverings (on existing walls)
- Wall paint color (simple repaint, same walls)
- Carpets, rugs, and floor runners (laid over existing flooring)
- Loose furniture: sofas, beds, chairs, tables, TV units, bookshelves, side tables
- Curtains, blinds, and curtain rods
- Cushions, throws, bed linen, upholstery covers
- Plug-in lamps (floor lamps, table lamps — NOT ceiling/wall fixtures)
- Wall art, framed prints, mirrors (hung on existing walls)
- Indoor plants and planters
- Decor accessories: vases, clocks, trays, baskets

YOUR PROCESS:
Step 1 — Room Analysis: Describe what you observe — approximate room size, current style, strengths, and what holds the room back visually. State assumptions explicitly if a photo is unclear.
Step 2 — Design Concept: Propose ONE primary makeover theme with rationale for this room and light conditions. Mention one alternative theme the customer could ask for instead.
Step 3 — After Vision: Describe the photorealistic after image in detail (same room, same angle, same fixtures — only cosmetic layer changed). This feeds our visual preview.
Step 4 — Itemized Cost Estimate: Realistic Bengaluru mid-range retail prices. Include labor/installation as separate lines where applicable. End with subtotal, labor total, 10% contingency, and grand total. Also provide a budget-version grand total with a one-line note on what gets downgraded.
Step 5 — Phasing: Suggest which items to buy first for maximum visual impact if spending over 2–3 months.

TONE: Be specific, practical, and honest. State assumptions rather than guessing silently.`;

export function buildStylistAgentPrompt(
  brief: RevampBrief,
  photoCount: number,
  hasPhotos: boolean,
) {
  const budget = BUDGET_BANDS.find((b) => b.id === brief.budgetBand);

  return `${STYLIST_AGENT_ROLE}

CUSTOMER BRIEF:
- Room type: ${labelFor(ROOM_TYPES, brief.roomType)}
- Preferred style hint: ${labelFor(DESIGN_STYLES, brief.designStyle)}
- Budget band: ${budget?.label ?? brief.budgetBand} (grand total should fit this band unless clearly explained)
- Priority: ${labelFor(PRIORITIES, brief.priority)}
- Timeline: ${brief.timeline || "As soon as possible"}
- Customer notes: ${brief.revampNotes || "Full cosmetic refresh"}
- Photos provided: ${photoCount}${hasPhotos ? " — analyze ALL uploaded photos before planning" : " — no photos in this request; plan for a typical Bengaluru room of this type and state assumptions"}

Belvie service context (weave in naturally):
- No room vacation — customer stays home during revamp
- Most cosmetic revamps completed in under 4 hours for styling/install items

Return ONLY valid JSON (no markdown fences, no extra text) in this exact shape:
{
  "roomAnalysis": "Step 1 paragraph — room size, current style, strengths, weaknesses, explicit assumptions",
  "primaryTheme": "e.g. Warm Minimalist",
  "designConcept": "Step 2 paragraph — theme rationale for this room and light",
  "alternativeTheme": "One alternative theme + brief why",
  "afterImageBrief": "Step 3 — detailed description of the after photo: same angle, same fixtures, only cosmetic changes visible (wallpaper, panels, carpet, furniture, curtains, decor)",
  "roomStructure": {
    "approximateDimensions": "e.g. 12ft x 14ft rectangular room — infer from photos",
    "ceilingHeight": "e.g. ~10ft flat ceiling with ceiling fan center",
    "cameraAngle": "e.g. shot from doorway, eye level, facing far wall — match photo 1",
    "floorType": "e.g. beige vitrified tiles, existing layout unchanged",
    "wallDescription": "e.g. plain white walls, built-in wardrobe on left wall",
    "lightDirection": "e.g. natural light from window on right wall",
    "referencePhotoIndex": 0,
    "fixtures": [
      {
        "type": "door|window|ceiling fan|switchboard|AC|built-in wardrobe|almirah",
        "position": "which wall and where on that wall",
        "description": "size, color, must stay exact in after image"
      }
    ],
    "existingFurniture": [
      {
        "item": "e.g. grey L-shaped sofa",
        "position": "center along far wall",
        "notes": "keep position; cushions/covers may change"
      }
    ]
  },
  "visionSummary": "2-3 sentence executive summary for the customer",
  "designDirection": "Same as designConcept or a tighter version for UI",
  "colorPalette": ["color 1", "color 2", "color 3"],
  "keyChanges": ["cosmetic change 1", "cosmetic change 2", "cosmetic change 3", "cosmetic change 4", "cosmetic change 5"],
  "assumptions": ["assumption 1 if any", "assumption 2 if any"],
  "costLineItems": [
    {
      "lineNumber": 1,
      "item": "Item name",
      "description": "Spec / size / material",
      "qty": 1,
      "estimatedUnitCost": 8000,
      "unitCostRange": "₹8,000–₹12,000",
      "estimatedTotal": 8000,
      "whereToBuy": "IKEA / Pepperfry / Amazon / local market",
      "isLabor": false,
      "category": "wallpaper|furniture|textiles|lighting|decor|paint|labor|other"
    }
  ],
  "costTotals": {
    "subtotal": 45000,
    "laborTotal": 5000,
    "contingencyPercent": 10,
    "contingency": 5000,
    "grandTotal": 55000,
    "budgetVersionTotal": 42000,
    "budgetVersionNote": "One line on what gets downgraded for budget version"
  },
  "phasingPlan": [
    "Month 1: buy X first for maximum impact because...",
    "Month 2: add Y and Z...",
    "Month 3: finishing touches..."
  ],
  "items": [
    {
      "name": "item name",
      "estimatedCost": 5000,
      "whereToBuy": "store in Bangalore",
      "category": "furniture|decor|lighting|textiles|paint|storage|other"
    }
  ],
  "estimatedBudget": {
    "min": 45000,
    "max": 55000,
    "breakdown": "short split across categories"
  },
  "timelineHours": 4,
  "bangaloreTip": "one practical local sourcing tip",
  "noVacationNote": "how revamp happens without customer leaving home"
}

Rules:
- Include 8–14 costLineItems covering wallpaper, panels or paint, carpet/rug, furniture, curtains, cushions, lamps, wall art, plants, and labor lines where needed.
- Mirror costLineItems into items[] (name + estimatedTotal as estimatedCost) for compatibility.
- estimatedBudget min/max should align with costTotals grandTotal (use a tight range).
- keyChanges must ONLY list allowed cosmetic layers — never structural or civil work.
- roomStructure must be detailed — list every visible door, window, fan, switch, and built-in with wall position. This feeds image generation.
- All amounts in INR integers.`;
}

function normalizeRoomStructure(
  raw: Partial<RoomStructure> | undefined,
): RoomStructure {
  if (!raw?.approximateDimensions && !raw?.fixtures?.length) {
    return defaultRoomStructure;
  }

  return {
    approximateDimensions:
      raw.approximateDimensions?.trim() ||
      defaultRoomStructure.approximateDimensions,
    ceilingHeight:
      raw.ceilingHeight?.trim() || defaultRoomStructure.ceilingHeight,
    cameraAngle: raw.cameraAngle?.trim() || defaultRoomStructure.cameraAngle,
    floorType: raw.floorType?.trim() || defaultRoomStructure.floorType,
    wallDescription:
      raw.wallDescription?.trim() || defaultRoomStructure.wallDescription,
    lightDirection:
      raw.lightDirection?.trim() || defaultRoomStructure.lightDirection,
    referencePhotoIndex:
      typeof raw.referencePhotoIndex === "number"
        ? raw.referencePhotoIndex
        : 0,
    fixtures: raw.fixtures?.length ? raw.fixtures : defaultRoomStructure.fixtures,
    existingFurniture: raw.existingFurniture ?? [],
  };
}

export function normalizeVision(raw: Partial<RevampVision>): RevampVision {
  const costLineItems = raw.costLineItems ?? [];
  let items = raw.items ?? [];

  if (!items.length && costLineItems.length) {
    items = costLineItems.map((line) => ({
      name: line.item,
      estimatedCost: line.estimatedTotal,
      whereToBuy: line.whereToBuy,
      category: line.category ?? "other",
    }));
  }

  const subtotalFromLines = costLineItems.reduce(
    (sum, line) => sum + (line.estimatedTotal ?? 0),
    0,
  );

  const costTotals = raw.costTotals ?? {
    subtotal: subtotalFromLines || items.reduce((s, i) => s + i.estimatedCost, 0),
    laborTotal: costLineItems
      .filter((l) => l.isLabor)
      .reduce((s, l) => s + l.estimatedTotal, 0),
    contingencyPercent: 10,
    contingency: Math.round(
      (subtotalFromLines || items.reduce((s, i) => s + i.estimatedCost, 0)) * 0.1,
    ),
    grandTotal:
      subtotalFromLines ||
      items.reduce((s, i) => s + i.estimatedCost, 0),
    budgetVersionTotal: Math.round(
      (subtotalFromLines ||
        items.reduce((s, i) => s + i.estimatedCost, 0)) * 0.8,
    ),
    budgetVersionNote: "Use local market alternatives and fewer accent pieces.",
  };

  if (!costTotals.grandTotal) {
    costTotals.grandTotal =
      costTotals.subtotal + costTotals.laborTotal + costTotals.contingency;
  }

  const roomAnalysis =
    raw.roomAnalysis?.trim() ||
    raw.visionSummary?.trim() ||
    "Room analysis pending — please review photos and brief.";

  const designConcept =
    raw.designConcept?.trim() ||
    raw.designDirection?.trim() ||
    "A cosmetic refresh tailored to your room and budget.";

  const vision: RevampVision = {
    roomAnalysis,
    primaryTheme: raw.primaryTheme?.trim() || "Modern Indian",
    designConcept,
    alternativeTheme:
      raw.alternativeTheme?.trim() ||
      "Japandi — calmer neutrals with natural wood accents",
    afterImageBrief:
      raw.afterImageBrief?.trim() ||
      "Same room photo with wallpaper, area rug, cushions, curtains, and plug-in lamps added.",
    roomStructure: normalizeRoomStructure(raw.roomStructure),
    visionSummary:
      raw.visionSummary?.trim() ||
      roomAnalysis.split(".").slice(0, 2).join(".") + ".",
    designDirection: raw.designDirection?.trim() || designConcept,
    colorPalette: raw.colorPalette?.length
      ? raw.colorPalette
      : ["Warm terracotta", "Sage green", "Cream"],
    keyChanges: sanitizeKeyChanges(raw.keyChanges ?? []),
    assumptions: raw.assumptions ?? [],
    costLineItems,
    costTotals,
    phasingPlan: raw.phasingPlan?.length
      ? raw.phasingPlan
      : [
          "Month 1: Wallpaper and curtains — biggest visual impact first.",
          "Month 2: Rug, cushions, and plug-in lighting.",
          "Month 3: Wall art, plants, and decor accents.",
        ],
    items,
    estimatedBudget: raw.estimatedBudget ?? {
      min: Math.round(costTotals.grandTotal * 0.95),
      max: costTotals.grandTotal,
      breakdown: "Materials, labor, and 10% contingency for Bengaluru sourcing.",
    },
    timelineHours: raw.timelineHours ?? 4,
    bangaloreTip:
      raw.bangaloreTip?.trim() ||
      "Check Chickpet and Commercial Street for fabrics; IKEA and Pepperfry for furniture.",
    noVacationNote:
      raw.noVacationNote?.trim() ||
      "We install wallpaper, curtains, and styling in your home while you stay — no shifting out.",
  };

  if (vision.keyChanges.length < 3) {
    vision.keyChanges = [
      "Peel-and-stick wallpaper on accent wall",
      "Area rug over existing flooring",
      "New cushions and throw on existing seating",
      "Curtains on existing windows",
      "Floor lamp and wall art",
    ];
  }

  if (!vision.items.length) {
    vision.items = vision.keyChanges.map((change, i) => ({
      name: change,
      estimatedCost: 5000 + i * 1500,
      whereToBuy: "Pepperfry / Amazon / local market",
      category: "decor",
    }));
  }

  return vision;
}

export function parseVisionJson(content: string): RevampVision {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const tryParse = (text: string) => {
    const parsed = JSON.parse(text) as Partial<RevampVision>;
    if (!parsed.roomAnalysis && !parsed.visionSummary) {
      throw new Error("Incomplete vision response");
    }
    if (!parsed.items?.length && !parsed.costLineItems?.length) {
      throw new Error("Incomplete vision response");
    }
    return normalizeVision(parsed);
  };

  try {
    return tryParse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Could not parse AI response. Please try again.");
    }
    return tryParse(match[0]);
  }
}
