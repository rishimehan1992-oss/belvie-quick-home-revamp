import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import {
  COMMERCIAL_DEFAULTS,
  breakEvenConsults,
  commercialFromNetwork,
  consultsFromNetwork,
  customerEconomics,
  ordersFromConsults,
  pnlVsConsults,
  pnlVsK,
  solvePnl,
} from "./pnl";

describe("ordersFromConsults", () => {
  it("is consults × conversion when there are no reorders", () => {
    expect(ordersFromConsults(1000, 60, 0)).toBeCloseTo(600, 6);
  });

  it("inflates by 1/(1−ρ) so visits match the network identity", () => {
    expect(ordersFromConsults(27000, 60, 35)).toBeCloseTo(24923.0769, 2);
  });
});

describe("solvePnl", () => {
  it("computes visit unit economics before network cost", () => {
    const row = solvePnl(
      { consults: 1, visitCost: 400, aov: 4000, conversion: 60, gm: 35 },
      { ...DEFAULTS, rho: 0, incCap: false },
    );
    expect(row.orders).toBeCloseTo(0.6, 6);
    expect(row.revenue).toBeCloseTo(2400, 6);
    expect(row.grossProfit).toBeCloseTo(840, 6);
    expect(row.visitAcq).toBe(400);
    expect(row.grossProfit - row.visitAcq).toBeCloseTo(440, 6);
  });

  it("P&L equals gross profit minus visit acquisition minus network", () => {
    const row = solvePnl(COMMERCIAL_DEFAULTS, { ...DEFAULTS, incCap: false });
    expect(row.feasible).toBe(true);
    expect(row.pnl).toBeCloseTo(row.grossProfit - row.visitAcq - row.network, 4);
  });

  it("improves when k rises from 1 to 3, holding consults fixed", () => {
    const k1 = solvePnl(COMMERCIAL_DEFAULTS, { ...DEFAULTS, k: 1, incCap: false });
    const k3 = solvePnl(COMMERCIAL_DEFAULTS, { ...DEFAULTS, k: 3, incCap: false });
    expect(k3.network).toBeLessThan(k1.network);
    expect(k3.pnl).toBeGreaterThan(k1.pnl);
  });
});

describe("series", () => {
  it("includes the current consult volume and is increasing in consults", () => {
    const series = pnlVsConsults(
      { ...COMMERCIAL_DEFAULTS, consults: 33000 },
      { ...DEFAULTS, incCap: false },
    );
    expect(series.some((p) => p.consults === 33000)).toBe(true);
    const consults = series.map((p) => p.consults);
    expect(consults).toEqual([...consults].sort((a, b) => a - b));
  });

  it("re-optimises spokes as k moves from 1 to 6", () => {
    const series = pnlVsK(COMMERCIAL_DEFAULTS, { ...DEFAULTS, incCap: false });
    expect(series).toHaveLength(6);
    expect(series[0].network).toBeGreaterThan(series[2].network);
  });

  it("finds a break-even consult volume when the curve crosses zero", () => {
    const series = pnlVsConsults(COMMERCIAL_DEFAULTS, { ...DEFAULTS, incCap: false });
    const be = breakEvenConsults(series);
    expect(be === null || be > 0).toBe(true);
  });
});

describe("link to network model", () => {
  it("recovers model-1 demand from consults × conversion / (1−ρ)", () => {
    expect(consultsFromNetwork(DEFAULTS)).toBeCloseTo(25000 * 0.65 / 0.6, 5);
    expect(ordersFromConsults(consultsFromNetwork(DEFAULTS), DEFAULTS.phi, DEFAULTS.rho)).toBeCloseTo(
      DEFAULTS.D,
      4,
    );
  });
});

describe("customer economics", () => {
  it("splits LTV into consult and non-consult orders per acquired customer", () => {
    const row = solvePnl(
      commercialFromNetwork(DEFAULTS, COMMERCIAL_DEFAULTS),
      DEFAULTS,
    );
    const eco = customerEconomics(COMMERCIAL_DEFAULTS, DEFAULTS, row.networkCpo);
    expect(eco.visitsPerCustomer).toBeCloseTo(1 / 0.6, 6);
    expect(eco.cac).toBeCloseTo(400 / 0.6, 4);
    expect(eco.consultOrdersPerCustomer).toBe(1);
    expect(eco.nonConsultOrdersPerCustomer).toBeCloseTo(0.35 / 0.65, 6);
    expect(eco.ordersPerCustomer).toBeCloseTo(1 / 0.65, 6);
    expect(eco.consultRevenueLtv).toBe(4000);
    expect(eco.nonConsultRevenueLtv).toBeCloseTo(4000 * (0.35 / 0.65), 4);
    expect(eco.revenueLtv).toBeCloseTo(4000 / 0.65, 4);
    expect(eco.consultGpLtv).toBeCloseTo(4000 * 0.35, 4);
    expect(eco.nonConsultGpLtv).toBeCloseTo(4000 * 0.35 * (0.35 / 0.65), 4);
    expect(eco.gpLtv).toBeCloseTo((4000 / 0.65) * 0.35, 4);
    expect(eco.ltvCac).toBeCloseTo(eco.gpLtv / eco.cac, 6);
    expect(eco.customersPerMonth).toBeCloseTo(25000 * 0.65, 4);
    expect(eco.nonConsultOrdersPerMonth).toBeCloseTo(25000 * 0.35, 4);
    expect(eco.paybackOrders).toBeCloseTo(eco.cac / (4000 * 0.35), 6);
  });
});
