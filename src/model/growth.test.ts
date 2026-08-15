import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import {
  CITIES,
  CITY_TARGET_DAY,
  GROWTH_MAX_DAY,
  GROWTH_MIN_DAY,
  MIN_OPEN_DAY,
  allocateOrdersByCity,
  evaluateGrowth,
  growthPhase,
  openDay,
} from "./growth";
import { COMMERCIAL_DEFAULTS } from "./pnl";

describe("allocateOrdersByCity", () => {
  it("puts early-days volume only in Bengaluru", () => {
    const a = allocateOrdersByCity(100);
    expect(a.blr).toBe(100);
    expect(CITIES.filter((c) => c.id !== "blr").every((c) => a[c.id] === 0)).toBe(true);
  });

  it("holds leftover on Bengaluru until the next city can seed at 100/day", () => {
    const thin = allocateOrdersByCity(CITY_TARGET_DAY + MIN_OPEN_DAY - 1);
    expect(thin.blr).toBe(CITY_TARGET_DAY + MIN_OPEN_DAY - 1);
    expect(thin.bom).toBe(0);

    const open = allocateOrdersByCity(CITY_TARGET_DAY + MIN_OPEN_DAY);
    expect(open.blr).toBe(CITY_TARGET_DAY);
    expect(open.bom).toBe(MIN_OPEN_DAY);
  });

  it("fills the five majors before any next metro", () => {
    const five = allocateOrdersByCity(5 * CITY_TARGET_DAY);
    expect(five.blr + five.bom + five.del + five.hyd + five.maa).toBe(5 * CITY_TARGET_DAY);
    expect(five.pnq).toBe(0);
    expect(CITIES.filter((c) => c.tier === "next").every((c) => five[c.id] === 0)).toBe(true);
  });

  it("lands on ten cities at 25,000 orders/day, 2,500 each", () => {
    expect(GROWTH_MAX_DAY).toBe(25000);
    const a = allocateOrdersByCity(GROWTH_MAX_DAY);
    const sum = CITIES.reduce((s, c) => s + a[c.id], 0);
    expect(sum).toBe(25000);
    for (const c of CITIES) expect(a[c.id]).toBe(CITY_TARGET_DAY);
  });

  it("never shrinks an earlier city once the next one is open", () => {
    const a = allocateOrdersByCity(5 * CITY_TARGET_DAY + MIN_OPEN_DAY);
    expect(a.blr).toBeGreaterThanOrEqual(CITY_TARGET_DAY);
    expect(a.bom).toBeGreaterThanOrEqual(CITY_TARGET_DAY);
    expect(a.pnq).toBeGreaterThanOrEqual(MIN_OPEN_DAY);
  });
});

describe("openDay", () => {
  it("opens Bengaluru at 100 and Mumbai after Bengaluru is filled plus a 100-order seed", () => {
    expect(openDay(0)).toBe(GROWTH_MIN_DAY);
    expect(openDay(1)).toBe(CITIES[0].targetDay + MIN_OPEN_DAY);
  });
});

describe("growthPhase", () => {
  it("names the 5 + 5 expansion", () => {
    expect(growthPhase(1, 0).id).toBe("seed");
    expect(growthPhase(3, 0).id).toBe("majors-open");
    expect(growthPhase(5, 0).id).toBe("majors");
    expect(growthPhase(5, 2).id).toBe("next-open");
    expect(growthPhase(5, 5).id).toBe("national");
  });
});

describe("evaluateGrowth", () => {
  const levers = {
    visitCost: COMMERCIAL_DEFAULTS.visitCost,
    samplingCost: COMMERCIAL_DEFAULTS.samplingCost,
    aov: COMMERCIAL_DEFAULTS.aov,
    nonConsultAov: COMMERCIAL_DEFAULTS.nonConsultAov,
    gm: COMMERCIAL_DEFAULTS.gm,
  };

  it("national totals equal the sum of live city P&Ls", () => {
    const twoCity = CITY_TARGET_DAY + MIN_OPEN_DAY;
    const snap = evaluateGrowth(twoCity, { ...DEFAULTS, incCap: false }, levers);
    expect(snap.citiesLive).toBe(2);
    expect(snap.feasible).toBe(true);
    const live = snap.rows.filter((r) => r.live && r.pnl);
    expect(snap.revenue).toBeCloseTo(
      live.reduce((s, r) => s + (r.pnl?.revenue ?? 0), 0),
      4,
    );
    expect(snap.network).toBeCloseTo(
      live.reduce((s, r) => s + (r.pnl?.network ?? 0), 0),
      4,
    );
    expect(snap.pnl).toBeCloseTo(snap.grossProfit - snap.visitAcq - snap.network - (snap.consults * levers.samplingCost), 0);
    expect(snap.orders).toBeCloseTo(twoCity * DEFAULTS.ddel, 4);
  });

  it("at 25,000/day runs ten independent networks at 2,500 each", () => {
    const snap = evaluateGrowth(GROWTH_MAX_DAY, { ...DEFAULTS, incCap: false }, levers);
    expect(snap.citiesLive).toBe(10);
    expect(snap.majorsLive).toBe(5);
    expect(snap.nextLive).toBe(5);
    expect(snap.phase.id).toBe("national");
    expect(snap.H).toBeGreaterThanOrEqual(10);
    expect(snap.S).toBeGreaterThanOrEqual(10);
    for (const row of snap.rows) {
      expect(row.live).toBe(true);
      expect(row.ordersDay).toBe(CITY_TARGET_DAY);
      expect(row.pnl?.feasible).toBe(true);
    }
  });
});
