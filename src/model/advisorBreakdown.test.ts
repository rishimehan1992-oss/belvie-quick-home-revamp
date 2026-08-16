import { describe, expect, it } from "vitest";
import { advisorBreakdown, advisorCostVsVolume } from "./advisorBreakdown";
import { DEFAULTS } from "./defaults";
import { COMMERCIAL_DEFAULTS, consultsFromNetwork } from "./pnl";
import { normalise, optimise } from "./solver";

describe("advisor defaults", () => {
  it("uses a 9 hour shift, 1 hour admin, and 20 min home to home", () => {
    expect(DEFAULTS.Tshift).toBe(540);
    expect(DEFAULTS.Tadmin).toBe(60);
    expect(DEFAULTS.tintra).toBe(20);
  });
});

describe("advisorBreakdown", () => {
  const { best } = optimise(normalise(DEFAULTS));
  if (!best) throw new Error("expected a feasible default network");
  const consults = consultsFromNetwork(DEFAULTS);
  const row = advisorBreakdown(best, DEFAULTS, consults, COMMERCIAL_DEFAULTS.visitCost);

  it("paid-day minutes sum to the shift", () => {
    const minutes = row.slices.reduce((s, l) => s + l.minutesDay, 0);
    expect(minutes).toBeCloseTo(DEFAULTS.Tshift, 6);
    expect(row.productiveMin).toBe(480);
  });

  it("allocated pay sums to advisor payroll", () => {
    const month = row.slices.reduce((s, l) => s + l.month, 0);
    expect(month).toBeCloseTo(best.Cadv, 4);
    expect(row.advisorPerOrder).toBeCloseTo(best.Cadv / DEFAULTS.D, 6);
  });

  it("hides home-to-home minutes at k=1 and uses them at k=3", () => {
    expect(row.slices.find((l) => l.id === "intra")?.minutesDay).toBeCloseTo(0, 6);
    const k3 = optimise(normalise({ ...DEFAULTS, k: 3 })).best;
    expect(k3).toBeTruthy();
    if (!k3) return;
    const intra = advisorBreakdown(k3, { ...DEFAULTS, k: 3 }, consults, COMMERCIAL_DEFAULTS.visitCost)
      .slices.find((l) => l.id === "intra");
    expect(intra?.minutesDay).toBeGreaterThan(0);
  });

  it("keeps visit CAC per order fixed in the mix", () => {
    const expected = COMMERCIAL_DEFAULTS.visitCost * (1 - DEFAULTS.rho / 100) / (DEFAULTS.phi / 100);
    expect(row.visitCacPerOrder).toBeCloseTo(expected, 6);
    expect(row.visitCacPerVisit).toBe(COMMERCIAL_DEFAULTS.visitCost);
  });
});

describe("advisorCostVsVolume", () => {
  it("visit CAC / order is flat while advisor / order falls as volume buys spokes", () => {
    const pts = advisorCostVsVolume(DEFAULTS, COMMERCIAL_DEFAULTS.visitCost).filter(
      (p) => p.feasible && p.advisorPerOrder != null && p.visitCacPerOrder != null,
    );
    const low = pts[0];
    const high = pts[pts.length - 1];
    expect(high.D).toBeGreaterThan(low.D);
    expect(low.visitCacPerOrder).toBeCloseTo(high.visitCacPerOrder ?? 0, 6);
    expect(low.advisorPerOrder ?? 0).toBeGreaterThan(high.advisorPerOrder ?? 0);
    expect(high.S ?? 0).toBeGreaterThan(low.S ?? 0);
  });
});
