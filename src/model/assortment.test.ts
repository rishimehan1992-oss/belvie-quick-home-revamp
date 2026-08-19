import { describe, expect, it } from "vitest";
import {
  A_SKU_SHARE_OF_SPOKE,
  ASSORTMENT_DEFAULTS,
  CATEGORIES,
  HUB_EXTRA_TARGET,
  HUB_SKU_TARGET,
  SPOKE_SKU_TARGET,
  UNIT_SHARE,
  assortmentInsight,
  assortmentTree,
  categoryTotals,
} from "./assortment";
import { DEFAULTS } from "./defaults";
import { COMMERCIAL_DEFAULTS } from "./pnl";

describe("assortment tree", () => {
  it("builds 850 fast-moving spoke SKUs and 400 hub extras to 1,250", () => {
    const tree = assortmentTree();
    expect(tree.spokeSkus).toBe(850);
    expect(tree.hubExtraSkus).toBe(400);
    expect(tree.hubSkus).toBe(1250);
    expect(tree.spokeSkus).toBe(SPOKE_SKU_TARGET);
    expect(tree.hubExtraSkus).toBe(HUB_EXTRA_TARGET);
    expect(tree.hubSkus).toBe(HUB_SKU_TARGET);
    expect(tree.spokeSkus).toBeGreaterThanOrEqual(800);
    expect(tree.spokeSkus).toBeLessThanOrEqual(900);
    expect(tree.hubSkus).toBeGreaterThanOrEqual(1200);
    expect(tree.hubSkus).toBeLessThanOrEqual(1300);
    for (const cat of CATEGORIES) {
      const t = categoryTotals(cat);
      expect(t.spokeSkus + t.hubExtraSkus).toBe(t.hubExtraSkus + t.spokeSkus);
    }
  });

  it("keeps limited colour drops hub-only", () => {
    const limited = CATEGORIES.find((c) => c.id === "limited");
    expect(limited).toBeTruthy();
    expect(categoryTotals(limited!).spokeSkus).toBe(0);
    expect(categoryTotals(limited!).hubExtraSkus).toBe(24);
  });

  it("is colour-cosmetics first: lips, complexion and eyes dominate the spoke", () => {
    const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, categoryTotals(c)]));
    const colourCore =
      byId.lipstick.spokeSkus +
      byId["lip-other"].spokeSkus +
      byId.foundation.spokeSkus +
      byId.concealer.spokeSkus +
      byId.powder.spokeSkus +
      byId.blush.spokeSkus +
      byId.bronzer.spokeSkus +
      byId.highlighter.spokeSkus +
      byId.eyeshadow.spokeSkus +
      byId.mascara.spokeSkus +
      byId.eyeliner.spokeSkus +
      byId.brows.spokeSkus;
    expect(colourCore).toBe(800);
    expect(byId.nails.spokeSkus + byId.primer.spokeSkus).toBe(50);
  });
});

describe("assortmentInsight", () => {
  const row = assortmentInsight(DEFAULTS, COMMERCIAL_DEFAULTS);

  it("splits units 60 / 25 / 15 and replenishes A faster than C", () => {
    expect(row.classes.map((c) => c.id)).toEqual(["A", "B", "C"]);
    expect(row.classes[0].unitShare).toBe(UNIT_SHARE.A);
    expect(row.classes[0].skus).toBe(Math.round(SPOKE_SKU_TARGET * A_SKU_SHARE_OF_SPOKE));
    expect(row.classes[0].replenishPerSkuMonth).toBeCloseTo(30 / ASSORTMENT_DEFAULTS.coverA, 6);
    expect(row.classes[0].replenishPerSkuMonth).toBeGreaterThan(row.classes[1].replenishPerSkuMonth);
    expect(row.classes[1].replenishPerSkuMonth).toBeGreaterThan(row.classes[2].replenishPerSkuMonth);
  });

  it("uses session demand for unit flow and S* for replenishment waves", () => {
    expect(row.unitsMonth).toBeCloseTo(DEFAULTS.D * ASSORTMENT_DEFAULTS.unitsPerOrder, 6);
    expect(row.S).toBeGreaterThan(1);
    expect(row.classes[0].wavesNetworkMonth).toBeCloseTo(
      row.classes[0].skus * row.S * row.classes[0].replenishPerSkuMonth,
      4,
    );
  });
});
