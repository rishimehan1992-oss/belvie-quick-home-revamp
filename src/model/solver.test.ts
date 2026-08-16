import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import { getInsights } from "./insights";
import { eac, normalise, optimise, solve } from "./solver";
import type { Params } from "./types";

function run(overrides: Partial<Params> = {}) {
  return optimise(normalise({ ...DEFAULTS, incCap: false, ...overrides }));
}

function expectCase(
  overrides: Partial<Params>,
  expected: {
    S: number;
    minS: number;
    N: number;
    cday: number;
    cycle: number;
    travel: number;
    drops: number;
    totalL: number;
    cpo: number;
  },
) {
  const { best } = run(overrides);
  expect(best).not.toBeNull();
  if (!best) return;
  expect(best.S).toBe(expected.S);
  expect(best.minS).toBe(expected.minS);
  expect(best.N).toBe(expected.N);
  expect(best.cday).toBeCloseTo(expected.cday, 2);
  expect(best.cycle).toBeCloseTo(expected.cycle, 0);
  expect(best.rt).toBeCloseTo(expected.travel, 0);
  expect(best.n).toBe(expected.drops);
  expect(best.total / 1e5).toBeCloseTo(expected.totalL, 1);
  expect(Math.abs(best.total / 1e5 - expected.totalL)).toBeLessThanOrEqual(0.05);
  expect(Math.round(best.cpo)).toBeCloseTo(expected.cpo, 0);
  expect(Math.abs(Math.round(best.cpo) - expected.cpo)).toBeLessThanOrEqual(1);
}

describe("eac", () => {
  it("matches spoke and hub annuity at 12% / 5 years", () => {
    expect(eac(1_950_000, 0.12, 5)).toBeCloseTo(43377, -1);
    expect(Math.abs(eac(1_950_000, 0.12, 5) - 43377)).toBeLessThanOrEqual(50);
    expect(eac(5_750_000, 0.12, 5)).toBeCloseTo(127906, -1);
    expect(Math.abs(eac(5_750_000, 0.12, 5) - 127906)).toBeLessThanOrEqual(50);
  });

  it("uses straight-line when cost of capital is zero", () => {
    expect(eac(1_950_000, 0, 5)).toBe(1_950_000 / (5 * 12));
    expect(Number.isFinite(eac(1_950_000, 0, 5))).toBe(true);
  });
});

describe("golden cases", () => {
  it("T1 base k=1, 8 min/km", () => {
    expectCase(
      {},
      {
        S: 10,
        minS: 9,
        N: 231,
        cday: 4.52,
        cycle: 106,
        travel: 49,
        drops: 33,
        totalL: 133.01,
        cpo: 532,
      },
    );
  });

  it("T2 k=3", () => {
    expectCase(
      { k: 3 },
      {
        S: 9,
        minS: 9,
        N: 173,
        cday: 6.03,
        cycle: 239,
        travel: 52,
        drops: 32,
        totalL: 107.89,
        cpo: 432,
      },
    );
  });

  it("T3 mkAdv=12", () => {
    expectCase(
      { mkAdv: 12 },
      {
        S: 13,
        minS: 9,
        N: 265,
        cday: 3.94,
        cycle: 122,
        travel: 65,
        drops: 35,
        totalL: 152.75,
        cpo: 611,
      },
    );
  });

  it("T4 mkAdv=12, k=3", () => {
    expectCase(
      { mkAdv: 12, k: 3 },
      {
        S: 9,
        minS: 9,
        N: 192,
        cday: 5.44,
        cycle: 265,
        travel: 78,
        drops: 32,
        totalL: 115.49,
        cpo: 462,
      },
    );
  });

  it("T5 mkAdv=3.3", () => {
    expectCase(
      { mkAdv: 3.3 },
      {
        S: 9,
        minS: 9,
        N: 171,
        cday: 6.12,
        cycle: 78,
        travel: 21,
        drops: 32,
        totalL: 107.09,
        cpo: 428,
      },
    );
  });

  it("T6 incCap=true", () => {
    expectCase(
      { incCap: true },
      {
        S: 10,
        minS: 9,
        N: 231,
        cday: 4.52,
        cycle: 106,
        travel: 49,
        drops: 33,
        totalL: 138.62,
        cpo: 554,
      },
    );
  });

  it("T7 D=20000", () => {
    expectCase(
      { D: 20000 },
      {
        S: 10,
        minS: 7,
        N: 185,
        cday: 4.52,
        cycle: 106,
        travel: 49,
        drops: 33,
        totalL: 112.48,
        cpo: 562,
      },
    );
  });

  it("T8 kapS=175, k=3", () => {
    expectCase(
      { kapS: 175, k: 3 },
      {
        S: 6,
        minS: 6,
        N: 182,
        cday: 5.75,
        cycle: 251,
        travel: 64,
        drops: 28,
        totalL: 106.3,
        cpo: 425,
      },
    );
  });

  it("T9 k=2, mkAdv=10", () => {
    expectCase(
      { k: 2, mkAdv: 10 },
      {
        S: 9,
        minS: 9,
        N: 203,
        cday: 5.14,
        cycle: 187,
        travel: 65,
        drops: 32,
        totalL: 119.89,
        cpo: 480,
      },
    );
  });
});

describe("regime change (T3 vs T4)", () => {
  it("at 12 min/km, k=1 sits above the capacity floor and k=3 pulls it back", () => {
    const t3 = run({ mkAdv: 12 }).best;
    const t4 = run({ mkAdv: 12, k: 3 }).best;
    expect(t3).not.toBeNull();
    expect(t4).not.toBeNull();
    if (!t3 || !t4) return;
    expect(t3.S).toBeGreaterThan(t3.minS);
    expect(t3.S).toBe(13);
    expect(t3.minS).toBe(9);
    expect(t4.S).toBe(t4.minS);
    expect(t4.S).toBe(9);
  });
});

describe("C3 replenishment envelope", () => {
  it("passes at defaults (37 min) and still yields a best network", () => {
    const p = normalise({ ...DEFAULTS, incCap: false });
    const result = optimise(p);
    const probe = solve(result.best?.S ?? 8, p);
    expect(probe.lineHaul).toBeCloseTo(37.0, 1);
    expect(probe.slaOK).toBe(true);
    expect(result.best).not.toBeNull();
    const banners = getInsights(p, result);
    expect(banners.some((b) => b.text.includes("Replenishment breaks"))).toBe(false);
  });

  it("fails at mkLine=3.5 (48 min) as a banner, without wiping the optimum", () => {
    const p = normalise({ ...DEFAULTS, incCap: false, mkLine: 3.5 });
    const result = optimise(p);
    const probe = solve(result.best?.S ?? 8, p);
    expect(probe.lineHaul).toBeCloseTo(48.0, 1);
    expect(probe.slaOK).toBe(false);
    expect(result.best).not.toBeNull();
    const banners = getInsights(p, result);
    expect(banners.some((b) => b.severity === "critical" && b.text.includes("Replenishment breaks"))).toBe(
      true,
    );
  });
});
