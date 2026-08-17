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
  mill: "Mill partner",
  design: "Design collab",
  value: "Value",
  specialist: "Specialist",
};

/**
 * Planning tree for a home-decor in-home consult. Brand names are line roles,
 * not observed vendor contracts. Spoke SKUs sum to 900; hub extras sum to 600.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    id: "curtains",
    name: "Curtains & drapes",
    meaning: "Core consult close. Colorways and heading types sit at the spoke.",
    brands: [
      { name: "House drapery", role: "house", spokeSkus: 28, hubExtraSkus: 12 },
      { name: "Mill partner — drapes", role: "mill", spokeSkus: 28, hubExtraSkus: 12 },
      { name: "Design collab — drapes", role: "design", spokeSkus: 24, hubExtraSkus: 12 },
      { name: "Value weaves", role: "value", spokeSkus: 22, hubExtraSkus: 10 },
      { name: "Blackout specialist", role: "specialist", spokeSkus: 20, hubExtraSkus: 10 },
      { name: "Outdoor / performance", role: "specialist", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Kids prints", role: "design", spokeSkus: 12, hubExtraSkus: 8 },
      { name: "Artisan weave", role: "specialist", spokeSkus: 10, hubExtraSkus: 8 },
    ],
  },
  {
    id: "sheers",
    name: "Sheers & linings",
    meaning: "Sold with drapes on the same visit. Tight spoke set; extra widths at hub.",
    brands: [
      { name: "House sheers", role: "house", spokeSkus: 20, hubExtraSkus: 8 },
      { name: "Mill linings", role: "mill", spokeSkus: 20, hubExtraSkus: 8 },
      { name: "Design sheers", role: "design", spokeSkus: 12, hubExtraSkus: 4 },
      { name: "Value sheers", role: "value", spokeSkus: 8, hubExtraSkus: 4 },
    ],
  },
  {
    id: "blinds",
    name: "Blinds",
    meaning: "Roller, venetian, motorised. Motorised extras stay hub-only.",
    brands: [
      { name: "House blinds", role: "house", spokeSkus: 24, hubExtraSkus: 8 },
      { name: "National OEM", role: "mill", spokeSkus: 22, hubExtraSkus: 8 },
      { name: "Motorised specialist", role: "specialist", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Wood / bamboo", role: "design", spokeSkus: 16, hubExtraSkus: 6 },
      { name: "Value aluminium", role: "value", spokeSkus: 12, hubExtraSkus: 6 },
    ],
  },
  {
    id: "upholstery",
    name: "Upholstery fabric",
    meaning: "By-the-metre after the consult. Deep color wall; slow SKUs at hub.",
    brands: [
      { name: "House fabric", role: "house", spokeSkus: 32, hubExtraSkus: 16 },
      { name: "Mill A", role: "mill", spokeSkus: 28, hubExtraSkus: 14 },
      { name: "Mill B", role: "mill", spokeSkus: 24, hubExtraSkus: 12 },
      { name: "Design textile", role: "design", spokeSkus: 20, hubExtraSkus: 10 },
      { name: "Performance / pet", role: "specialist", spokeSkus: 18, hubExtraSkus: 10 },
      { name: "Value fabric", role: "value", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Outdoor fabric", role: "specialist", spokeSkus: 12, hubExtraSkus: 6 },
      { name: "Artisan textile", role: "specialist", spokeSkus: 10, hubExtraSkus: 4 },
    ],
  },
  {
    id: "wallpaper",
    name: "Wallpaper",
    meaning: "High sample intensity on the visit; sellable rolls follow from spoke or hub.",
    brands: [
      { name: "House wall", role: "house", spokeSkus: 22, hubExtraSkus: 10 },
      { name: "Design print", role: "design", spokeSkus: 20, hubExtraSkus: 12 },
      { name: "National wallcover", role: "mill", spokeSkus: 18, hubExtraSkus: 8 },
      { name: "Kids / theme", role: "design", spokeSkus: 16, hubExtraSkus: 10 },
      { name: "Texture / grasscloth", role: "specialist", spokeSkus: 14, hubExtraSkus: 8 },
    ],
  },
  {
    id: "rugs",
    name: "Rugs",
    meaning: "Bulky. Spoke holds sizes that fit a van; oversized stays hub.",
    brands: [
      { name: "House rugs", role: "house", spokeSkus: 16, hubExtraSkus: 10 },
      { name: "Flatweave mill", role: "mill", spokeSkus: 14, hubExtraSkus: 10 },
      { name: "Design rugs", role: "design", spokeSkus: 10, hubExtraSkus: 8 },
      { name: "Value rugs", role: "value", spokeSkus: 8, hubExtraSkus: 8 },
    ],
  },
  {
    id: "soft",
    name: "Cushions & throws",
    meaning: "Attach to the curtain/upholstery ticket. Fast color refresh.",
    brands: [
      { name: "House cushions", role: "house", spokeSkus: 22, hubExtraSkus: 8 },
      { name: "Throws mill", role: "mill", spokeSkus: 18, hubExtraSkus: 6 },
      { name: "Design soft", role: "design", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Value soft", role: "value", spokeSkus: 14, hubExtraSkus: 6 },
    ],
  },
  {
    id: "hardware",
    name: "Rods, tracks, hardware",
    meaning: "Must sit with window SKUs or the install fails. Compact, high attach.",
    brands: [
      { name: "House hardware", role: "house", spokeSkus: 28, hubExtraSkus: 6 },
      { name: "Track systems", role: "specialist", spokeSkus: 24, hubExtraSkus: 6 },
      { name: "Finials / decorative", role: "design", spokeSkus: 16, hubExtraSkus: 4 },
      { name: "Value hardware", role: "value", spokeSkus: 12, hubExtraSkus: 4 },
    ],
  },
  {
    id: "paint",
    name: "Paint & stains",
    meaning: "Sellable tins/colors. Testers on the visit are the sampling slider, not these SKUs.",
    brands: [
      { name: "House paint", role: "house", spokeSkus: 28, hubExtraSkus: 16 },
      { name: "Partner decorative", role: "mill", spokeSkus: 24, hubExtraSkus: 16 },
      { name: "Specialty finish", role: "specialist", spokeSkus: 20, hubExtraSkus: 16 },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    meaning: "Small lamps and shades that fit spoke. Statement pieces hub-only.",
    brands: [
      { name: "House lighting", role: "house", spokeSkus: 16, hubExtraSkus: 8 },
      { name: "Partner lamps", role: "mill", spokeSkus: 14, hubExtraSkus: 6 },
      { name: "Specialist lighting", role: "specialist", spokeSkus: 10, hubExtraSkus: 6 },
    ],
  },
  {
    id: "accessories",
    name: "Decor accessories",
    meaning: "Low-AOV attach. Spoke is a tight edit; seasonal extras at hub.",
    brands: [
      { name: "House decor", role: "house", spokeSkus: 12, hubExtraSkus: 10 },
      { name: "Partner decor", role: "design", spokeSkus: 10, hubExtraSkus: 10 },
      { name: "Value decor", role: "value", spokeSkus: 8, hubExtraSkus: 10 },
    ],
  },
  {
    id: "seasonal",
    name: "Seasonal & specials",
    meaning: "Festival, monsoon, trial buys. Never duplicated at every spoke.",
    brands: [
      { name: "Festival edit", role: "design", spokeSkus: 0, hubExtraSkus: 50 },
      { name: "Monsoon / outdoor", role: "specialist", spokeSkus: 0, hubExtraSkus: 40 },
      { name: "Trial & clearance", role: "value", spokeSkus: 0, hubExtraSkus: 60 },
    ],
  },
];

export const SPOKE_SKU_TARGET = 900;
export const HUB_EXTRA_TARGET = 600;
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
    classRow("A", "Fast movers at spoke", "every spoke", aSkus, UNIT_SHARE.A, levers.coverA, unitsMonth * UNIT_SHARE.A, S),
    classRow("B", "Core spoke edit", "every spoke", bSkus, UNIT_SHARE.B, levers.coverB, unitsMonth * UNIT_SHARE.B, S),
    classRow("C", "Hub tail & seasonal", "hub only", cSkus, UNIT_SHARE.C, levers.coverC, unitsMonth * UNIT_SHARE.C, H),
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
