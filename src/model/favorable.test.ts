import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import {
  COMBOS,
  FAVORABLE_AOV,
  FAVORABLE_K,
  FAVORABLE_N,
  comboIdFor,
  favorableGrid,
  holdFromSession,
  materialize,
  minProfitableAov,
  nearestGridK,
  scaleOrdersMonth,
  sweepFavorable,
} from "./favorable";
import { COMMERCIAL_DEFAULTS, nonConsultsPerConsult } from "./pnl";

const levers = {
  visitCost: COMMERCIAL_DEFAULTS.visitCost,
  samplingCost: COMMERCIAL_DEFAULTS.samplingCost,
  aov: COMMERCIAL_DEFAULTS.aov,
  nonConsultAov: COMMERCIAL_DEFAULTS.nonConsultAov,
  gm: COMMERCIAL_DEFAULTS.gm,
};

describe("favorableGrid", () => {
  it("covers AOV × n × k at mature-city volume", () => {
    const D = scaleOrdersMonth({ ...DEFAULTS });
    expect(D).toBe(2500 * DEFAULTS.ddel);
    const grid = favorableGrid({ ...DEFAULTS, incCap: false }, levers, D);
    expect(grid.slices).toHaveLength(FAVORABLE_K.length);
    expect(grid.slices[0].cells).toHaveLength(FAVORABLE_AOV.length * FAVORABLE_N.length);
    expect(grid.best).toBeTruthy();
    expect(grid.best && grid.best.pnl.pnl).toBeGreaterThan(0);
  });

  it("higher k or AOV is at least as profitable as the lean corner", () => {
    const grid = favorableGrid(
      { ...DEFAULTS, incCap: false },
      levers,
      scaleOrdersMonth(DEFAULTS),
    );
    const lean = grid.slices[0].cells.find((c) => c.aov === 2000 && c.n === 0);
    const rich = grid.slices[3].cells.find((c) => c.aov === 8000 && c.n === 3);
    expect(lean && rich).toBeTruthy();
    if (!lean || !rich) return;
    expect(rich.pnl.feasible).toBe(true);
    expect(rich.pnl.pnl).toBeGreaterThan(lean.pnl.pnl);
  });

  it("higher sampling cost shrinks the green pocket", () => {
    const D = scaleOrdersMonth(DEFAULTS);
    const cheap = favorableGrid(
      { ...DEFAULTS, incCap: false },
      { ...levers, samplingCost: 50 },
      D,
    );
    const dear = favorableGrid(
      { ...DEFAULTS, incCap: false },
      { ...levers, samplingCost: 250 },
      D,
    );
    expect(cheap.greenShare).toBeGreaterThanOrEqual(dear.greenShare);
    expect(cheap.best && dear.best).toBeTruthy();
    if (!cheap.best || !dear.best) return;
    expect(cheap.best.pnl.pnl).toBeGreaterThan(dear.best.pnl.pnl);
  });

  it("names a break-even AOV on a k slice when one exists", () => {
    const grid = favorableGrid(
      { ...DEFAULTS, incCap: false },
      levers,
      scaleOrdersMonth(DEFAULTS),
    );
    const k3 = grid.slices.find((s) => s.facet === 3);
    expect(k3).toBeTruthy();
    if (!k3) return;
    const minAov = minProfitableAov(k3);
    expect(minAov === null || minAov >= 2000).toBe(true);
    expect(nearestGridK(3)).toBe(3);
  });
});

describe("sweepFavorable", () => {
  it("builds a visit × conversion map at the held mix", () => {
    const hold = holdFromSession(DEFAULTS, levers);
    const grid = sweepFavorable(
      { ...DEFAULTS, incCap: false },
      hold,
      scaleOrdersMonth(DEFAULTS),
      { x: "visitCost", y: "conversion", facet: null },
    );
    expect(grid.slices).toHaveLength(1);
    expect(grid.slices[0].cells.length).toBeGreaterThan(10);
    expect(comboIdFor(grid.spec)).toBe("visit-phi");
    expect(COMBOS.some((c) => c.id === "aov-n-k")).toBe(true);
  });

  it("materialize writes conversion and mix onto the network", () => {
    const hold = holdFromSession(DEFAULTS, levers);
    hold.conversion = 80;
    hold.n = 2;
    hold.k = 3;
    const { network, levers: next } = materialize(hold, DEFAULTS, 75000);
    expect(network.phi).toBe(80);
    expect(network.k).toBe(3);
    expect(network.D).toBe(75000);
    expect(next.aov).toBe(hold.aov);
    expect(nonConsultsPerConsult(network.rho)).toBeCloseTo(2, 5);
  });
});
