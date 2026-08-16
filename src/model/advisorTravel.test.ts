import { describe, expect, it } from "vitest";
import { advisorTravelBySpoke, spokeStep } from "./advisorTravel";
import { DEFAULTS } from "./defaults";
import { dbar, normalise, optimise } from "./solver";

describe("advisorTravelBySpoke", () => {
  const { rows, best } = optimise(normalise(DEFAULTS));
  const pts = advisorTravelBySpoke(rows, DEFAULTS, best?.S ?? null);

  it("uses d̄(S) = 0.40 · τ · √(A/S) and round trip = 2 · d̄ · min/km", () => {
    const s1 = pts.find((p) => p.S === 1);
    const s4 = pts.find((p) => p.S === 4);
    expect(s1 && s4).toBeTruthy();
    if (!s1 || !s4) return;
    expect(s1.dBar).toBeCloseTo(dbar(DEFAULTS.A, 1, DEFAULTS.tau), 8);
    expect(s4.dBar / s1.dBar).toBeCloseTo(0.5, 8);
    expect(s1.travelMin).toBeCloseTo(2 * s1.dBar * DEFAULTS.mkAdv, 6);
    expect(s1.rtKm).toBeCloseTo(2 * s1.dBar, 8);
  });

  it("each extra spoke shortens mean distance and travel minutes", () => {
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].dBar).toBeLessThan(pts[i - 1].dBar);
      expect(pts[i].travelMin).toBeLessThan(pts[i - 1].travelMin);
      expect(pts[i].catchment).toBeLessThan(pts[i - 1].catchment);
    }
  });

  it("adding one spoke from S* cuts distance by 1 − √(S/(S+1))", () => {
    const star = pts.find((p) => p.isBest);
    const next = pts.find((p) => p.S === (star?.S ?? 0) + 1);
    expect(star && next).toBeTruthy();
    if (!star || !next) return;
    const step = spokeStep(star, next);
    expect(step.pctShorter).toBeCloseTo(1 - Math.sqrt(star.S / next.S), 8);
    expect(step.kmSaved).toBeGreaterThan(0);
    expect(step.minSaved).toBeGreaterThan(0);
  });
});
