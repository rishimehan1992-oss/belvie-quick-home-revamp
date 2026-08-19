import { normalise, optimise } from "./solver";
import type { Params } from "./types";

export type BrandRole = "house" | "mill" | "design" | "value" | "specialist";

export type BrandLine = {
  name: string;
  role: BrandRole;
  spokeSkus: number;
  hubExtraSkus: number;
};

export type CategoryDef = {
  id: string;
  name: string;
  meaning: string;
  brands: BrandLine[];
};

export type VelocityClass = "A" | "B" | "C";

export type AssortmentLevers = {
  unitsPerOrder: number;
  coverA: number;
  coverB: number;
  coverC: number;
  spokeUnitShare: number;
};

export const ASSORTMENT_DEFAULTS: AssortmentLevers = {
  unitsPerOrder: 1.4,
  coverA: 10,
  coverB: 21,
  coverC: 40,
  spokeUnitShare: 0.85,
};

/** A SKUs are the fast fifth of the spoke list; they take most of the unit volume. */
export const A_SKU_SHARE_OF_SPOKE = 0.18;
export const UNIT_SHARE = { A: 0.6, B: 0.25, C: 0.15 } as const;

export const ROLE_LABEL: Record<BrandRole, string> = {
  house: "House",
  mill: "Lab partner",
  design: "Artist collab",
  value: "Value",
  specialist: "Specialist",
};

/**
 * BPC planning tree, colour-cosmetics first. Brand names are line roles, not
 * contracts. Fast-moving spoke SKUs sum to 850 (inside 800–900). Hub catalog
 * sums to 1,250 (inside 1,200–1,300). Slow extras are 400.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    id: "lipstick",
    name: "Lipstick",
    meaning: "Core consult close. Hero nudes and daily mattes at the spoke; extra undertones at hub.",
    brands: [
      { name: "House lipstick", role: "house", spokeSkus: 48, hubExtraSkus: 20 },
      { name: "Lab partner lips", role: "mill", spokeSkus: 40, hubExtraSkus: 18 },
      { name: "Artist collab lips", role: "design", spokeSkus: 28, hubExtraSkus: 16 },
      { name: "Nude wardrobe", role: "specialist", spokeSkus: 24, hubExtraSkus: 14 },
      { name: "Matte specialist", role: "specialist", spokeSkus: 20, hubExtraSkus: 12 },
    ],
  },
  {
    id: "lip-other",
    name: "Lip gloss, liner, crayon",
    meaning: "Attach to lipstick on the same visit. Tight spoke set.",
    brands: [
      { name: "House gloss", role: "house", spokeSkus: 20, hubExtraSkus: 8 },
      { name: "Liners", role: "specialist", spokeSkus: 18, hubExtraSkus: 8 },
      { name: "Balm / crayon", role: "value", spokeSkus: 12, hubExtraSkus: 4 },
      { name: "Value gloss", role: "value", spokeSkus: 10, hubExtraSkus: 4 },
    ],
  },
  {
    id: "foundation",
    name: "Foundation",
    meaning: "Shade-matched on the consult. Spoke holds the running range; deep/rare undertones at hub.",
    brands: [
      { name: "House foundation", role: "house", spokeSkus: 36, hubExtraSkus: 20 },
      { name: "Lab complexion", role: "mill", spokeSkus: 32, hubExtraSkus: 18 },
      { name: "Shade-inclusive", role: "specialist", spokeSkus: 28, hubExtraSkus: 16 },
      { name: "Stick / travel", role: "value", spokeSkus: 24, hubExtraSkus: 16 },
    ],
  },
  {
    id: "concealer",
    name: "Concealer & corrector",
    meaning: "Sold with foundation. Fast SKUs are the everyday concealers.",
    brands: [
      { name: "House concealer", role: "house", spokeSkus: 28, hubExtraSkus: 12 },
      { name: "Colour corrector", role: "specialist", spokeSkus: 18, hubExtraSkus: 8 },
      { name: "Partner concealer", role: "mill", spokeSkus: 14, hubExtraSkus: 6 },
      { name: "Brightening", role: "design", spokeSkus: 10, hubExtraSkus: 4 },
    ],
  },
  {
    id: "powder",
    name: "Powder & setting",
    meaning: "Compacts and setting powder that finish the complexion service.",
    brands: [
      { name: "House powder", role: "house", spokeSkus: 18, hubExtraSkus: 6 },
      { name: "Setting specialist", role: "specialist", spokeSkus: 16, hubExtraSkus: 6 },
      { name: "Compact", role: "value", spokeSkus: 11, hubExtraSkus: 4 },
    ],
  },
  {
    id: "blush",
    name: "Blush",
    meaning: "Cheeks. Cream and powder in the daily colours sit at the spoke.",
    brands: [
      { name: "House blush", role: "house", spokeSkus: 24, hubExtraSkus: 8 },
      { name: "Partner blush", role: "mill", spokeSkus: 20, hubExtraSkus: 8 },
      { name: "Cream blush", role: "design", spokeSkus: 16, hubExtraSkus: 8 },
    ],
  },
  {
    id: "bronzer",
    name: "Bronzer & contour",
    meaning: "Sculpt. Smaller shade wall than blush; extras at hub.",
    brands: [
      { name: "House bronzer", role: "house", spokeSkus: 18, hubExtraSkus: 6 },
      { name: "Contour", role: "specialist", spokeSkus: 12, hubExtraSkus: 6 },
      { name: "Partner bronzer", role: "mill", spokeSkus: 10, hubExtraSkus: 4 },
    ],
  },
  {
    id: "highlighter",
    name: "Highlighter",
    meaning: "Highlight shades that attach to the complexion ticket.",
    brands: [
      { name: "House highlight", role: "house", spokeSkus: 16, hubExtraSkus: 6 },
      { name: "Partner highlight", role: "mill", spokeSkus: 12, hubExtraSkus: 4 },
      { name: "Liquid highlight", role: "design", spokeSkus: 7, hubExtraSkus: 4 },
    ],
  },
  {
    id: "eyeshadow",
    name: "Eyeshadow & palettes",
    meaning: "Eyes. Daily quads and singles at the spoke; extra palettes at hub.",
    brands: [
      { name: "House palettes", role: "house", spokeSkus: 32, hubExtraSkus: 16 },
      { name: "Singles", role: "value", spokeSkus: 28, hubExtraSkus: 12 },
      { name: "Artist palettes", role: "design", spokeSkus: 24, hubExtraSkus: 12 },
      { name: "Partner eyes", role: "mill", spokeSkus: 16, hubExtraSkus: 10 },
    ],
  },
  {
    id: "mascara",
    name: "Mascara",
    meaning: "High repeat. Few SKUs, fast turns.",
    brands: [
      { name: "House mascara", role: "house", spokeSkus: 16, hubExtraSkus: 4 },
      { name: "Volume / length", role: "specialist", spokeSkus: 14, hubExtraSkus: 4 },
      { name: "Partner mascara", role: "mill", spokeSkus: 10, hubExtraSkus: 4 },
    ],
  },
  {
    id: "eyeliner",
    name: "Eyeliner",
    meaning: "Pencil, gel, liquid. Daily colours at the spoke.",
    brands: [
      { name: "House liner", role: "house", spokeSkus: 14, hubExtraSkus: 4 },
      { name: "Pencil / gel", role: "specialist", spokeSkus: 12, hubExtraSkus: 4 },
      { name: "Partner liner", role: "mill", spokeSkus: 9, hubExtraSkus: 4 },
    ],
  },
  {
    id: "brows",
    name: "Brows",
    meaning: "Pencil, gel, pomade. Fast brow SKUs travel with the eye edit.",
    brands: [
      { name: "House brow", role: "house", spokeSkus: 14, hubExtraSkus: 4 },
      { name: "Pencil / gel", role: "specialist", spokeSkus: 12, hubExtraSkus: 4 },
      { name: "Partner brow", role: "mill", spokeSkus: 9, hubExtraSkus: 4 },
    ],
  },
  {
    id: "nails",
    name: "Nail colour",
    meaning: "Colour, but slower than face. Small spoke edit.",
    brands: [
      { name: "House nail colour", role: "house", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Partner nails", role: "mill", spokeSkus: 14, hubExtraSkus: 8 },
    ],
  },
  {
    id: "primer",
    name: "Colour primer / tinted",
    meaning: "Tinted primer and colour bases used in the complexion service.",
    brands: [{ name: "Tinted primer", role: "specialist", spokeSkus: 20, hubExtraSkus: 0 }],
  },
  {
    id: "limited",
    name: "Limited & seasonal colour",
    meaning: "Festival and drop shades. Hub only — not cloned to every spoke.",
    brands: [{ name: "Limited colour drops", role: "design", spokeSkus: 0, hubExtraSkus: 24 }],
  },
];

/** Fast-moving colour on every spoke (inside 800–900). */
export const SPOKE_SKU_TARGET = 850;
/** Slow shades + limited at hub only. */
export const HUB_EXTRA_TARGET = 400;
/** Full BPC colour catalog (inside 1,200–1,300). */
export const HUB_SKU_TARGET = SPOKE_SKU_TARGET + HUB_EXTRA_TARGET;

export function categoryTotals(cat: CategoryDef) {
  return {
    spokeSkus: cat.brands.reduce((s, b) => s + b.spokeSkus, 0),
    hubExtraSkus: cat.brands.reduce((s, b) => s + b.hubExtraSkus, 0),
    brandCount: cat.brands.length,
  };
}

export function assortmentTree() {
  const categories = CATEGORIES.map((cat) => {
    const t = categoryTotals(cat);
    return { ...cat, spokeSkus: t.spokeSkus, hubExtraSkus: t.hubExtraSkus, hubSkus: t.spokeSkus + t.hubExtraSkus };
  });
  const spokeSkus = categories.reduce((s, c) => s + c.spokeSkus, 0);
  const hubExtraSkus = categories.reduce((s, c) => s + c.hubExtraSkus, 0);
  const brands = categories.reduce((s, c) => s + c.brands.length, 0);
  return {
    categories,
    spokeSkus,
    hubExtraSkus,
    hubSkus: spokeSkus + hubExtraSkus,
    brands,
  };
}

export type ClassRow = {
  id: VelocityClass;
  label: string;
  place: string;
  skus: number;
  unitShare: number;
  coverDays: number;
  unitsMonth: number;
  unitsPerSkuMonth: number;
  replenishPerSkuMonth: number;
  wavesNetworkMonth: number;
  flowUnits: number;
  floorUnits: number;
  onHandUnits: number;
};

export type AssortmentInsight = {
  tree: ReturnType<typeof assortmentTree>;
  D: number;
  S: number;
  H: number;
  unitsMonth: number;
  unitCost: number;
  classes: ClassRow[];
  spokeUnitsMonth: number;
  hubOnlyUnitsMonth: number;
  inventorySpoke: number;
  inventoryHub: number;
  inventoryTotal: number;
  spokeFloorBinds: boolean;
  catalogChurnYear: number;
};

export function assortmentInsight(
  params: Params,
  commercial: { aov: number; gm: number },
  levers: AssortmentLevers = ASSORTMENT_DEFAULTS,
): AssortmentInsight {
  const tree = assortmentTree();
  const { best } = optimise(normalise(params));
  const S = best?.S ?? Math.max(1, Math.ceil(((params.D / params.ddel) * params.peak) / params.kapS));
  const H = best?.H ?? Math.max(1, Math.ceil(params.D / params.kapH));
  const unitsMonth = params.D * levers.unitsPerOrder;
  const gm = commercial.gm / 100;
  const unitCost =
    levers.unitsPerOrder > 0 ? (commercial.aov * (1 - gm)) / levers.unitsPerOrder : 0;

  const aSkus = Math.round(tree.spokeSkus * A_SKU_SHARE_OF_SPOKE);
  const bSkus = tree.spokeSkus - aSkus;
  const cSkus = tree.hubExtraSkus;

  const spokeUnitsMonth = unitsMonth * levers.spokeUnitShare;
  const hubOnlyUnitsMonth = unitsMonth * (1 - levers.spokeUnitShare);

  const classes: ClassRow[] = [
    classRow("A", "Fastest colour shades", "every spoke", aSkus, UNIT_SHARE.A, levers.coverA, unitsMonth * UNIT_SHARE.A, S),
    classRow("B", "Fast-moving colour", "every spoke", bSkus, UNIT_SHARE.B, levers.coverB, unitsMonth * UNIT_SHARE.B, S),
    classRow("C", "Slow shades & limited", "hub only", cSkus, UNIT_SHARE.C, levers.coverC, unitsMonth * UNIT_SHARE.C, H),
  ];

  const inventorySpoke = (classes[0].onHandUnits + classes[1].onHandUnits) * unitCost;
  const hubPipeline = (classes[0].unitsMonth + classes[1].unitsMonth) * (7 / 30);
  const inventoryHub = (hubPipeline + classes[2].onHandUnits) * unitCost;
  const spokeFloorBinds =
    classes[0].floorUnits + classes[1].floorUnits > classes[0].flowUnits + classes[1].flowUnits;

  return {
    tree,
    D: params.D,
    S,
    H,
    unitsMonth,
    unitCost,
    classes,
    spokeUnitsMonth,
    hubOnlyUnitsMonth,
    inventorySpoke,
    inventoryHub,
    inventoryTotal: inventorySpoke + inventoryHub,
    spokeFloorBinds,
    catalogChurnYear: 0.2,
  };
}

function classRow(
  id: VelocityClass,
  label: string,
  place: string,
  skus: number,
  unitShare: number,
  coverDays: number,
  unitsMonth: number,
  nodes: number,
): ClassRow {
  const unitsPerSkuMonth = skus > 0 ? unitsMonth / skus : 0;
  const replenishPerSkuMonth = coverDays > 0 ? 30 / coverDays : 0;
  const flowUnits = unitsMonth * (coverDays / 30);
  const floorUnits = skus * nodes;
  return {
    id,
    label,
    place,
    skus,
    unitShare,
    coverDays,
    unitsMonth,
    unitsPerSkuMonth,
    replenishPerSkuMonth,
    wavesNetworkMonth: skus * nodes * replenishPerSkuMonth,
    flowUnits,
    floorUnits,
    onHandUnits: Math.max(flowUnits, floorUnits),
  };
}
