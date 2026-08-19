import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import {
  LIFESTYLE_DEFAULTS,
  lifestylePoint,
  simulateLifestyle,
} from "./lifestyle";
import { COMMERCIAL_DEFAULTS } from "./pnl";

describe("lifestylePoint", () => {
  it("sells 0.2 handbags per consult at 40% margin — handbags only", () => {
    const row = lifestylePoint(1000, LIFESTYLE_DEFAULTS);
    expect(row.units).toBeCloseTo(200, 6);
    expect(row.gm).toBe(40);
    expect(row.gp).toBeCloseTo(row.revenue * 0.4, 6);
    expect(row.blendedAov).toBe(14000);
    expect(row.lines.map((l) => l.id)).toEqual(["bags"]);
    expect(row.lines[0].share).toBeCloseTo(1, 8);
  });
});

describe("simulateLifestyle", () => {
  it("adds lifestyle GP on top of beauty P&L without changing S*", () => {
    const sim = simulateLifestyle(DEFAULTS, COMMERCIAL_DEFAULTS, LIFESTYLE_DEFAULTS);
    expect(sim.lifestyle.attachPerConsult).toBe(0.2);
    expect(sim.combinedGp).toBeCloseTo(sim.beauty.grossProfit + sim.lifestyle.gp, 4);
    expect(sim.combinedCogs).toBeCloseTo(sim.beauty.cogs + sim.lifestyle.cogs, 4);
    expect(sim.combinedRevenue).toBeCloseTo(sim.beauty.revenue + sim.lifestyle.revenue, 4);
    if (sim.beauty.feasible) {
      expect(sim.combinedPnl).toBeCloseTo(sim.beauty.pnl + sim.lifestyle.gp, 4);
      expect(sim.beauty.S).toBeGreaterThan(0);
    }
  });

  it("compares beauty-only vs beauty+lifestyle with CAC and network unchanged", () => {
    const sim = simulateLifestyle(DEFAULTS, COMMERCIAL_DEFAULTS, LIFESTYLE_DEFAULTS);
    const { compare, beauty, lifestyle, eco } = sim;
    const pnlBy = Object.fromEntries(compare.pnl.map((r) => [r.key, r]));
    const unitBy = Object.fromEntries(compare.units.map((r) => [r.key, r]));

    expect(pnlBy.cac.delta).toBe(0);
    expect(pnlBy.samp.delta).toBe(0);
    expect(pnlBy.net.delta).toBe(0);
    expect(pnlBy.rev.combined).toBeCloseTo(beauty.revenue + lifestyle.revenue, 4);
    expect(pnlBy.gp.combined).toBeCloseTo(beauty.grossProfit + lifestyle.gp, 4);
    if (beauty.feasible) {
      expect(pnlBy.pnl.combined).toBeCloseTo(beauty.pnl + lifestyle.gp, 4);
      expect(pnlBy.pnl.delta).toBeCloseTo(lifestyle.gp, 4);
    }

    expect(unitBy.cac.delta).toBe(0);
    expect(unitBy.cpo.delta).toBe(0);
    expect(unitBy.cpo.beauty).toBe(beauty.networkCpo);
    expect(unitBy.costConsult.delta).toBe(0);
    expect(unitBy.gpConsult.delta).toBeCloseTo(lifestyle.gpPerConsult, 6);
    expect(unitBy.contrib.delta).toBeCloseTo(lifestyle.gp / eco.customersPerMonth, 4);
    expect(unitBy.ltvcac.combined).toBeGreaterThan(unitBy.ltvcac.beauty);
    expect(unitBy.attach.combined).toBe(0.2);
  });
});
