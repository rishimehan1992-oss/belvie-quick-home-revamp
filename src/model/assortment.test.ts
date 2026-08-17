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
  it("builds 900 spoke SKUs and 600 hub extras to 1,500", () => {
    const tree = assortmentTree();
    expect(tree.spokeSkus).toBe(SPOKE_SKU_TARGET);
    expect(tree.hubExtraSkus).toBe(HUB_EXTRA_TARGET);
    expect(tree.hubSkus).toBe(HUB_SKU_TARGET);
    for (const cat of CATEGORIES) {
      const t = categoryTotals(cat);
      expect(t.spokeSkus + t.hubExtraSkus).toBe(t.spokeSkus + t.hubExtraSkus);
    }
  });

  it("keeps seasonal lines hub-only", () => {
    const seasonal = CATEGORIES.find((c) => c.id === "seasonal");
    expect(seasonal).toBeTruthy();
    expect(categoryTotals(seasonal!).spokeSkus).toBe(0);
    expect(categoryTotals(seasonal!).hubExtraSkus).toBe(150);
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
