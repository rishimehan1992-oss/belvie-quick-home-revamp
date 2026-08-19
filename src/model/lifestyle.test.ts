import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import {
  LIFESTYLE_DEFAULTS,
  lifestylePoint,
  simulateLifestyle,
} from "./lifestyle";
import { COMMERCIAL_DEFAULTS } from "./pnl";

describe("lifestylePoint", () => {
  it("sells 0.5 units per consult at 40% margin inside the ₹8k–20k band", () => {
    const row = lifestylePoint(1000, LIFESTYLE_DEFAULTS);
    expect(row.units).toBeCloseTo(500, 6);
    expect(row.gm).toBe(40);
    expect(row.gp).toBeCloseTo(row.revenue * 0.4, 6);
    expect(row.blendedAov).toBeGreaterThanOrEqual(8000);
    expect(row.blendedAov).toBeLessThanOrEqual(20000);
    expect(row.lines.map((l) => l.id)).toEqual(["bags", "footwear", "watches"]);
    const shares = row.lines.reduce((s, l) => s + l.share, 0);
    expect(shares).toBeCloseTo(1, 8);
  });
});

describe("simulateLifestyle", () => {
  it("adds lifestyle GP on top of beauty P&L without changing S*", () => {
    const sim = simulateLifestyle(DEFAULTS, COMMERCIAL_DEFAULTS, LIFESTYLE_DEFAULTS);
    expect(sim.lifestyle.attachPerConsult).toBe(0.5);
    expect(sim.combinedGp).toBeCloseTo(sim.beauty.grossProfit + sim.lifestyle.gp, 4);
    if (sim.beauty.feasible) {
      expect(sim.combinedPnl).toBeCloseTo(sim.beauty.pnl + sim.lifestyle.gp, 4);
    }
  });
});
