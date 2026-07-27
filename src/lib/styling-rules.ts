/** Shared rules — Belvie never changes core structure, only cosmetic styling */

export const STRUCTURE_MUST_PRESERVE = [
  "room dimensions, proportions, and perspective",
  "ceiling height and layout footprint",
  "walls, doors, door frames, and door positions",
  "windows, window grills, and window positions",
  "built-in almirahs, wardrobes, and kitchen units",
  "flooring structure and tile layout (rugs may be added on top)",
  "columns, beams, and ceiling",
  "ceiling fans, light fixtures, switchboards, sockets",
  "AC units, geysers, taps, and plumbing fixtures",
  "camera angle for before/after comparison",
];

export const ALLOWED_STYLING_ONLY = [
  "wallpaper or peel-and-stick wall coverings on existing walls",
  "wall paint color (simple repaint, same walls)",
  "carpets, rugs, and floor runners over existing flooring",
  "loose furniture: sofas, beds, chairs, tables, TV units, bookshelves, side tables",
  "curtains, blinds, and curtain rods",
  "cushions, throws, bed linen, upholstery covers",
  "plug-in lamps (floor lamps, table lamps — not ceiling/wall fixtures)",
  "wall art, framed prints, mirrors on existing walls",
  "indoor plants and planters",
  "decor accessories: vases, clocks, trays, baskets",
  "removable wall panels",
];

export const FORBIDDEN_CHANGES = [
  "civil work, demolition, or false ceiling",
  "moving or removing doors, windows, or built-ins",
  "changing wall alignment or knocking walls",
  "tile replacement or flooring structure changes",
  "plumbing or electrical rework",
  "painting that requires wall repair",
  "replacing or relocating ceiling fans or fixed fixtures",
  "changing room layout or floor plan",
];

export function stylingRulesPromptBlock(): string {
  return `
HARD CONSTRAINTS — NEVER VIOLATE:
MUST PRESERVE: ${STRUCTURE_MUST_PRESERVE.join("; ")}.

ONLY ALLOWED (cosmetic layer): ${ALLOWED_STYLING_ONLY.join("; ")}.

NEVER SUGGEST OR SHOW: ${FORBIDDEN_CHANGES.join("; ")}.
`.trim();
}

export function imageEditPromptPrefix(): string {
  return [
    "STRICT PHOTO EDIT — same exact photograph, same camera angle.",
    "PRESERVE: room size, doors, windows, built-in almirahs, ceiling fans, switches, floor tiles, fixtures.",
    "ONLY ADD: wallpaper, carpet/rug, loose furniture, curtains, cushions, plug-in lamps, wall art, plants, decor.",
    "FORBIDDEN: structural changes, civil work, moving fixtures, layout changes.",
  ].join(" ");
}

export function sanitizeKeyChanges(changes: string[]): string[] {
  const blocked =
    /knock|demolish|remove wall|move door|relocate|new window|resize|false ceiling|civil|plumb|electrical rework|tile replacement|structural|built.?in replacement/i;
  return changes.filter((c) => !blocked.test(c));
}
