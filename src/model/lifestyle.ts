import {
  consultScale,
  consultsFromNetwork,
  ordersFromConsults,
  solvePnl,
  type CommercialLevers,
} from "./pnl";
import type { Params, PnlPoint } from "./types";

export type LifestyleId = "bags" | "footwear" | "watches";

export type LifestyleCategory = {
  id: LifestyleId;
  name: string;
  meaning: string;
  share: number;
  aov: number;
};

export type LifestyleLevers = {
  attachPerConsult: number;
  gm: number;
  categories: LifestyleCategory[];
};

export const LIFESTYLE_AOV_MIN = 8000;
export const LIFESTYLE_AOV_MAX = 20000;

export const LIFESTYLE_DEFAULTS: LifestyleLevers = {
  attachPerConsult: 0.5,
  gm: 40,
  categories: [
    {
      id: "bags",
      name: "Handbags",
      meaning: "Premium bags sold after the in-home consult. Lower frequency than beauty.",
      share: 0.4,
      aov: 14000,
    },
    {
      id: "footwear",
      name: "Footwear",
      meaning: "Premium shoes delivered to the same consulted customer.",
      share: 0.35,
      aov: 10000,
    },
    {
      id: "watches",
      name: "Watches",
      meaning: "Premium watches. Slowest of the three, highest ticket.",
      share: 0.25,
      aov: 16000,
    },
  ],
};

export function clampLifestyleAov(aov: number): number {
  if (!Number.isFinite(aov)) return LIFESTYLE_AOV_MIN;
  return Math.min(LIFESTYLE_AOV_MAX, Math.max(LIFESTYLE_AOV_MIN, aov));
}

export type LifestyleLine = {
  id: LifestyleId;
  name: string;
  meaning: string;
  share: number;
  aov: number;
  units: number;
  revenue: number;
  cogs: number;
  gp: number;
};

export type LifestylePoint = {
  consults: number;
  attachPerConsult: number;
  units: number;
  blendedAov: number;
  gm: number;
  revenue: number;
  cogs: number;
  gp: number;
  gpPerConsult: number;
  lines: LifestyleLine[];
};

export function lifestylePoint(consults: number, levers: LifestyleLevers): LifestylePoint {
  const attach = Math.max(levers.attachPerConsult, 0);
  const gm = Math.min(Math.max(levers.gm, 0), 100) / 100;
  const shareSum = levers.categories.reduce((s, c) => s + c.share, 0) || 1;
  const lines: LifestyleLine[] = levers.categories.map((c) => {
    const share = c.share / shareSum;
    const aov = clampLifestyleAov(c.aov);
    const units = consults * attach * share;
    const revenue = units * aov;
    return {
      id: c.id,
      name: c.name,
      meaning: c.meaning,
      share,
      aov,
      units,
      revenue,
      cogs: revenue * (1 - gm),
      gp: revenue * gm,
    };
  });
  const units = lines.reduce((s, l) => s + l.units, 0);
  const revenue = lines.reduce((s, l) => s + l.revenue, 0);
  const gp = lines.reduce((s, l) => s + l.gp, 0);
  const cogs = revenue - gp;
  return {
    consults,
    attachPerConsult: attach,
    units,
    blendedAov: units > 0 ? revenue / units : 0,
    gm: levers.gm,
    revenue,
    cogs,
    gp,
    gpPerConsult: consults > 0 ? gp / consults : 0,
    lines,
  };
}

export type LifestyleSim = {
  beauty: PnlPoint;
  lifestyle: LifestylePoint;
  combinedPnl: number;
  combinedRevenue: number;
  combinedGp: number;
};

export function simulateLifestyle(
  params: Params,
  commercial: CommercialLevers,
  levers: LifestyleLevers,
): LifestyleSim {
  const consults = consultsFromNetwork(params);
  const beauty = solvePnl(
    {
      consults,
      conversion: params.phi,
      visitCost: commercial.visitCost,
      samplingCost: commercial.samplingCost,
      aov: commercial.aov,
      nonConsultAov: commercial.nonConsultAov,
      gm: commercial.gm,
    },
    params,
  );
  const lifestyle = lifestylePoint(consults, levers);
  const combinedPnl = (beauty.feasible ? beauty.pnl : 0) + lifestyle.gp;
  return {
    beauty,
    lifestyle,
    combinedPnl,
    combinedRevenue: beauty.revenue + lifestyle.revenue,
    combinedGp: beauty.grossProfit + lifestyle.gp,
  };
}

export function lifestyleVsConsults(
  params: Params,
  commercial: CommercialLevers,
  levers: LifestyleLevers,
): { consults: number; beautyPnl: number | null; lifestyleGp: number; combined: number | null }[] {
  return consultScale(consultsFromNetwork(params)).map((v) => {
    const beauty = solvePnl(
      {
        consults: v,
        conversion: params.phi,
        visitCost: commercial.visitCost,
        samplingCost: commercial.samplingCost,
        aov: commercial.aov,
        nonConsultAov: commercial.nonConsultAov,
        gm: commercial.gm,
      },
      { ...params, D: ordersFromConsults(v, params.phi, params.rho) },
    );
    const life = lifestylePoint(v, levers);
    const beautyPnl = beauty.feasible ? beauty.pnl : null;
    return {
      consults: v,
      beautyPnl,
      lifestyleGp: life.gp,
      combined: beautyPnl == null ? null : beautyPnl + life.gp,
    };
  });
}

export function lifestyleVsAttach(consults: number, levers: LifestyleLevers): LifestylePoint[] {
  const scale = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1];
  const values = new Set(scale);
  values.add(Math.round(levers.attachPerConsult * 100) / 100);
  return [...values]
    .sort((a, b) => a - b)
    .map((attachPerConsult) => lifestylePoint(consults, { ...levers, attachPerConsult }));
}

export function lifestyleVsTicket(consults: number, levers: LifestyleLevers): LifestylePoint[] {
  const scale = [8000, 10000, 12000, 14000, 16000, 18000, 20000];
  return scale.map((aov) =>
    lifestylePoint(consults, {
      ...levers,
      categories: levers.categories.map((c) => ({ ...c, aov })),
    }),
  );
}
