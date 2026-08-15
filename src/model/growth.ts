import { commercialFromNetwork, solvePnl, type CommercialLevers } from "./pnl";
import type { Params, PnlPoint } from "./types";

export type CityTier = "major" | "next";

export interface City {
  id: string;
  name: string;
  short: string;
  tier: CityTier;
  /** Planning catchment km² — not municipal limits. */
  A: number;
  /** Mature local demand, orders / day. Ten cities × 2,500 = 25,000 national. */
  targetDay: number;
}

export const CITY_TARGET_DAY = 2500;

export const CITIES: City[] = [
  { id: "blr", name: "Bengaluru", short: "BLR", tier: "major", A: 350, targetDay: CITY_TARGET_DAY },
  { id: "bom", name: "Mumbai", short: "BOM", tier: "major", A: 480, targetDay: CITY_TARGET_DAY },
  { id: "del", name: "Delhi NCR", short: "DEL", tier: "major", A: 750, targetDay: CITY_TARGET_DAY },
  { id: "hyd", name: "Hyderabad", short: "HYD", tier: "major", A: 400, targetDay: CITY_TARGET_DAY },
  { id: "maa", name: "Chennai", short: "MAA", tier: "major", A: 350, targetDay: CITY_TARGET_DAY },
  { id: "pnq", name: "Pune", short: "PNQ", tier: "next", A: 280, targetDay: CITY_TARGET_DAY },
  { id: "amd", name: "Ahmedabad", short: "AMD", tier: "next", A: 240, targetDay: CITY_TARGET_DAY },
  { id: "ccu", name: "Kolkata", short: "CCU", tier: "next", A: 280, targetDay: CITY_TARGET_DAY },
  { id: "cok", name: "Kochi", short: "COK", tier: "next", A: 150, targetDay: CITY_TARGET_DAY },
  { id: "jai", name: "Jaipur", short: "JAI", tier: "next", A: 200, targetDay: CITY_TARGET_DAY },
];

export const GROWTH_MIN_DAY = 100;
export const GROWTH_MAX_DAY = CITIES.length * CITY_TARGET_DAY;
/** Do not open the next city thinner than early-days Bengaluru. */
export const MIN_OPEN_DAY = 100;

export const CITY_COLORS: Record<string, string> = {
  blr: "#BA5D42",
  bom: "#2B2622",
  del: "#4A7A5C",
  hyd: "#8C9A8E",
  maa: "#6B6560",
  pnq: "#A67C5D",
  amd: "#5C6B7A",
  ccu: "#B08968",
  cok: "#7A5C6B",
  jai: "#C9BEB6",
};

export interface GrowthJump {
  day: number;
  label: string;
}

export const GROWTH_JUMPS: GrowthJump[] = [
  { day: 100, label: "Early days" },
  { day: 250, label: "Bengaluru density" },
  { day: CITY_TARGET_DAY, label: "Bengaluru filled" },
  { day: CITY_TARGET_DAY + MIN_OPEN_DAY, label: "Second metro" },
  { day: 5 * CITY_TARGET_DAY, label: "Five majors" },
  { day: 5 * CITY_TARGET_DAY + MIN_OPEN_DAY, label: "Next metros" },
  { day: GROWTH_MAX_DAY, label: "25,000 / day" },
];

export function cityCatalog(blrArea: number): City[] {
  return CITIES.map((c) => (c.id === "blr" ? { ...c, A: blrArea } : c));
}

export function openDay(
  index: number,
  cities: City[] = CITIES,
  minOpen = MIN_OPEN_DAY,
): number {
  if (index <= 0) return GROWTH_MIN_DAY;
  const prefix = cities.slice(0, index).reduce((s, c) => s + c.targetDay, 0);
  return prefix + minOpen;
}

/**
 * Fill cities in order: mature the current city, then seed the next at ≥ minOpen
 * orders/day. Leftover thinner than that stays on the last live city so a new
 * hub is never opened on a handful of orders.
 */
export function allocateOrdersByCity(
  ordersDay: number,
  cities: City[] = CITIES,
  minOpen = MIN_OPEN_DAY,
): Record<string, number> {
  const alloc: Record<string, number> = {};
  for (const c of cities) alloc[c.id] = 0;
  if (!(ordersDay > 0) || cities.length === 0) return alloc;

  let remaining = ordersDay;
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const last = i === cities.length - 1;
    if (last) {
      alloc[city.id] = remaining;
      break;
    }
    const take = Math.min(city.targetDay, remaining);
    const leftover = remaining - take;
    if (leftover > 0 && leftover < minOpen) {
      alloc[city.id] = take + leftover;
      remaining = 0;
      break;
    }
    alloc[city.id] = take;
    remaining = leftover;
    if (remaining <= 0) break;
  }
  return alloc;
}

export type GrowthPhaseId = "seed" | "majors-open" | "majors" | "next-open" | "national";

export function growthPhase(
  liveMajors: number,
  liveNext: number,
): { id: GrowthPhaseId; label: string } {
  const live = liveMajors + liveNext;
  if (live <= 1) return { id: "seed", label: "Early days · Bengaluru" };
  if (liveNext === 0 && liveMajors < 5) {
    return { id: "majors-open", label: "Opening the five major metros" };
  }
  if (liveNext === 0 && liveMajors === 5) {
    return { id: "majors", label: "Five major metros" };
  }
  if (liveNext > 0 && live < 10) {
    return { id: "next-open", label: "Opening the next five metros" };
  }
  return { id: "national", label: "Ten cities · five + five" };
}

export interface CitySnapshot {
  city: City;
  ordersDay: number;
  live: boolean;
  mature: boolean;
  pnl: PnlPoint | null;
}

export interface GrowthSnapshot {
  ordersDay: number;
  phase: { id: GrowthPhaseId; label: string };
  citiesLive: number;
  majorsLive: number;
  nextLive: number;
  byCity: Record<string, number>;
  rows: CitySnapshot[];
  orders: number;
  consults: number;
  revenue: number;
  grossProfit: number;
  visitAcq: number;
  network: number;
  networkCpo: number;
  S: number;
  N: number;
  H: number;
  pnl: number;
  feasible: boolean;
}

function emptyNational(ordersDay: number, byCity: Record<string, number>): GrowthSnapshot {
  return {
    ordersDay,
    phase: growthPhase(0, 0),
    citiesLive: 0,
    majorsLive: 0,
    nextLive: 0,
    byCity,
    rows: [],
    orders: 0,
    consults: 0,
    revenue: 0,
    grossProfit: 0,
    visitAcq: 0,
    network: 0,
    networkCpo: Infinity,
    S: 0,
    N: 0,
    H: 0,
    pnl: NaN,
    feasible: false,
  };
}

export function evaluateGrowth(
  ordersDay: number,
  params: Params,
  commercial: CommercialLevers,
  cities: City[] = cityCatalog(params.A),
): GrowthSnapshot {
  const byCity = allocateOrdersByCity(ordersDay, cities);
  const rows: CitySnapshot[] = cities.map((city) => {
    const od = byCity[city.id] ?? 0;
    const live = od > 0;
    const mature = live && od + 1e-9 >= city.targetDay;
    if (!live) {
      return { city, ordersDay: 0, live: false, mature: false, pnl: null };
    }
    const D = od * params.ddel;
    const network = { ...params, D, A: city.A };
    const minS = Math.ceil((od * params.peak) / params.kapS);
    const maxS = Math.min(80, Math.max(28, minS + 8));
    const pnl = solvePnl(commercialFromNetwork(network, commercial), network, maxS);
    return { city, ordersDay: od, live: true, mature, pnl };
  });

  const live = rows.filter((r) => r.live);
  if (!live.length) return emptyNational(ordersDay, byCity);

  const majorsLive = live.filter((r) => r.city.tier === "major").length;
  const nextLive = live.filter((r) => r.city.tier === "next").length;
  const feasible = live.every((r) => r.pnl?.feasible);
  const orders = live.reduce((s, r) => s + (r.pnl?.orders ?? 0), 0);
  const consults = live.reduce((s, r) => s + (r.pnl?.consults ?? 0), 0);
  const revenue = live.reduce((s, r) => s + (r.pnl?.revenue ?? 0), 0);
  const grossProfit = live.reduce((s, r) => s + (r.pnl?.grossProfit ?? 0), 0);
  const visitAcq = live.reduce((s, r) => s + (r.pnl?.visitAcq ?? 0), 0);
  const sampling = live.reduce((s, r) => s + (r.pnl?.sampling ?? 0), 0);
  const network = live.reduce((s, r) => s + (r.pnl?.feasible ? r.pnl.network : 0), 0);
  const S = live.reduce((s, r) => s + (r.pnl?.S ?? 0), 0);
  const N = live.reduce((s, r) => s + (r.pnl?.N ?? 0), 0);
  const H = live.reduce((s, r) => s + (r.pnl?.H ?? 0), 0);
  const pnl = feasible ? grossProfit - visitAcq - sampling - network : NaN;

  return {
    ordersDay,
    phase: growthPhase(majorsLive, nextLive),
    citiesLive: live.length,
    majorsLive,
    nextLive,
    byCity,
    rows,
    orders,
    consults,
    revenue,
    grossProfit,
    visitAcq,
    network,
    networkCpo: orders > 0 && feasible ? network / orders : Infinity,
    S,
    N,
    H,
    pnl,
    feasible,
  };
}

export function growthVolumes(
  step = 250,
  cities: City[] = CITIES,
  minOpen = MIN_OPEN_DAY,
): number[] {
  const values = new Set<number>();
  for (let v = GROWTH_MIN_DAY; v <= GROWTH_MAX_DAY; v += step) values.add(v);
  for (const jump of GROWTH_JUMPS) values.add(jump.day);
  for (let i = 0; i < cities.length; i++) values.add(openDay(i, cities, minOpen));
  return [...values].filter((v) => v >= GROWTH_MIN_DAY && v <= GROWTH_MAX_DAY).sort((a, b) => a - b);
}

export function growthPath(
  params: Params,
  commercial: CommercialLevers,
  volumes?: number[],
): GrowthSnapshot[] {
  const cities = cityCatalog(params.A);
  const xs = volumes ?? growthVolumes(250, cities);
  return xs.map((v) => evaluateGrowth(v, params, commercial, cities));
}
