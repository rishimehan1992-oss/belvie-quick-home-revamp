/** Shared rules — Belvie never changes core structure, only styling layers */

export const STRUCTURE_MUST_PRESERVE = [
  "door positions and door frames",
  "wall alignment, wall angles, and room shape",
  "built-in cabinets, wardrobes, and kitchen units",
  "window size, position, and frames",
  "floor tiles / flooring layout",
  "ceiling height and beams",
  "room dimensions and camera angle",
  "existing fixed furniture placement (sofa, bed, desk stay in same spot)",
];

export const ALLOWED_STYLING_ONLY = [
  "wallpaper on existing walls",
  "removable wall panels / wall art",
  "carpet / area rug",
  "cushion covers and throws",
  "curtains / drapes",
  "additional small furniture (side table, lamp stand, stool)",
  "floor lamps, table lamps, string lights",
  "decor accents (vases, frames, plants, organisers)",
  "sofa / chair covers (not replacing the piece)",
  "bedding and linens",
];

export const FORBIDDEN_CHANGES = [
  "moving or removing doors",
  "changing wall alignment or knocking walls",
  "replacing or relocating cabinets",
  "new windows or resized windows",
  "civil work or demolition",
  "changing room layout or floor plan",
  "replacing built-in wardrobes",
  "moving kitchen/bathroom fixtures",
];

export function stylingRulesPromptBlock(): string {
  return `
STRICT BELVIE RULES — STRUCTURE IS SACRED:
MUST PRESERVE (do not change in plan or image): ${STRUCTURE_MUST_PRESERVE.join("; ")}.

ONLY ALLOWED: ${ALLOWED_STYLING_ONLY.join("; ")}.

NEVER SUGGEST OR SHOW: ${FORBIDDEN_CHANGES.join("; ")}.
`.trim();
}

export function imageEditPromptPrefix(): string {
  return [
    "STRICT PHOTO EDIT — same exact photograph.",
    "PRESERVE PIXEL-PERFECT: doors, door frames, wall lines, wall corners, built-in cabinets, wardrobes, windows, floor tiles, ceiling, room shape, camera angle.",
    "ONLY ADD ON TOP: wallpaper on walls, carpet/rug, cushion covers, curtains, lamps, wall art, small decor, removable panels.",
    "FORBIDDEN: moving doors, changing walls, new cabinets, layout change, civil work, replacing built-ins.",
  ].join(" ");
}

export function sanitizeKeyChanges(changes: string[]): string[] {
  const blocked = /knock|demolish|remove wall|move door|relocate|new window|resize|built.?in|cabinet replacement|change layout|floor plan|structural/i;
  return changes.filter((c) => !blocked.test(c));
}
