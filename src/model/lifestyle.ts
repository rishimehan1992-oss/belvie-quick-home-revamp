import {
  consultScale,
  consultsFromNetwork,
  customerEconomics,
  ordersFromConsults,
  solvePnl,
  type CommercialLevers,
} from "./pnl";
import type { CustomerEconomics, Params, PnlPoint } from "./types";

export type LifestyleId = "bags";

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

/**
 * Attach is handbags per consult — not 0.2 of each line, and not a combined
 * bags+footwear+watches mix. Footwear and watches are out for now.
 */
export const LIFESTYLE_DEFAULTS: LifestyleLevers = {
  attachPerConsult: 0.2,
  gm: 40,
  categories: [
    {
      id: "bags",
      name: "Handbags",
      meaning: "Premium bags on the same consult. 0.2 bags / visit — handbags only.",
      share: 1,
      aov: 14000,
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
  eco: CustomerEconomics;
  combinedPnl: number;
  combinedRevenue: number;
  combinedGp: number;
  combinedCogs: number;
  compare: LifestyleCompare;
};

export type PnlCompareRow = {
  key: string;
  label: string;
  beauty: number;
  lifestyle: number;
  combined: number;
  delta: number;
  unchanged?: boolean;
  strong?: boolean;
};

export type UnitCompareRow = {
  key: string;
  label: string;
  beauty: number;
  combined: number;
  delta: number;
  format: "inr" | "x" | "num";
  unchanged?: boolean;
  strong?: boolean;
};

export type LifestyleCompare = {
  pnl: PnlCompareRow[];
  units: UnitCompareRow[];
  beautyPnl: number;
  combinedPnl: number;
  lift: number;
  customers: number;
};

function per(n: number, den: number): number {
  return den > 0 && Number.isFinite(n) ? n / den : NaN;
}

export function lifestyleCompare(
  beauty: PnlPoint,
  lifestyle: LifestylePoint,
  eco: CustomerEconomics,
): LifestyleCompare {
  const consults = beauty.consults;
  const orders = beauty.orders;
  const customers = eco.customersPerMonth;
  const lifeRev = lifestyle.revenue;
  const lifeCogs = lifestyle.cogs;
  const lifeGp = lifestyle.gp;
  const beautyPnl = beauty.feasible ? beauty.pnl : NaN;
  const combinedPnl = beauty.feasible ? beauty.pnl + lifeGp : NaN;
  const beautyNet = beauty.feasible ? -beauty.network : NaN;
  const gpLtvLife = per(lifeGp, customers);
  const revLtvLife = per(lifeRev, customers);
  const combinedGpLtv = Number.isFinite(eco.gpLtv) ? eco.gpLtv + gpLtvLife : NaN;
  const combinedLtvCac =
    eco.cac > 0 && Number.isFinite(combinedGpLtv) ? combinedGpLtv / eco.cac : NaN;
  const allInConsult =
    per(beauty.visitAcq, consults) +
    per(beauty.sampling, consults) +
    (beauty.feasible ? per(beauty.network, consults) : NaN);

  const pnl: PnlCompareRow[] = [
    {
      key: "rev",
      label: "Revenue",
      beauty: beauty.revenue,
      lifestyle: lifeRev,
      combined: beauty.revenue + lifeRev,
      delta: lifeRev,
    },
    {
      key: "cogs",
      label: "COGS",
      beauty: -beauty.cogs,
      lifestyle: -lifeCogs,
      combined: -(beauty.cogs + lifeCogs),
      delta: -lifeCogs,
    },
    {
      key: "gp",
      label: "Gross profit",
      beauty: beauty.grossProfit,
      lifestyle: lifeGp,
      combined: beauty.grossProfit + lifeGp,
      delta: lifeGp,
      strong: true,
    },
    {
      key: "cac",
      label: "Visit CAC",
      beauty: -beauty.visitAcq,
      lifestyle: 0,
      combined: -beauty.visitAcq,
      delta: 0,
      unchanged: true,
    },
    {
      key: "samp",
      label: "Sampling",
      beauty: -beauty.sampling,
      lifestyle: 0,
      combined: -beauty.sampling,
      delta: 0,
      unchanged: true,
    },
    {
      key: "net",
      label: "Network (optimum)",
      beauty: beautyNet,
      lifestyle: 0,
      combined: beautyNet,
      delta: beauty.feasible ? 0 : NaN,
      unchanged: true,
    },
    {
      key: "pnl",
      label: "P&L",
      beauty: beautyPnl,
      lifestyle: lifeGp,
      combined: combinedPnl,
      delta: beauty.feasible ? lifeGp : NaN,
      strong: true,
    },
  ];

  const units: UnitCompareRow[] = [
    {
      key: "revConsult",
      label: "Revenue / consult",
      beauty: per(beauty.revenue, consults),
      combined: per(beauty.revenue + lifeRev, consults),
      delta: per(lifeRev, consults),
      format: "inr",
    },
    {
      key: "gpConsult",
      label: "Gross profit / consult",
      beauty: per(beauty.grossProfit, consults),
      combined: per(beauty.grossProfit + lifeGp, consults),
      delta: lifestyle.gpPerConsult,
      format: "inr",
    },
    {
      key: "costConsult",
      label: "All-in cost / consult",
      beauty: allInConsult,
      combined: allInConsult,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "pnlConsult",
      label: "P&L / consult",
      beauty: beauty.pnlPerConsult,
      combined: per(combinedPnl, consults),
      delta: per(lifeGp, consults),
      format: "inr",
      strong: true,
    },
    {
      key: "revCust",
      label: "Revenue / customer",
      beauty: eco.revenueLtv,
      combined: eco.revenueLtv + revLtvLife,
      delta: revLtvLife,
      format: "inr",
    },
    {
      key: "gpCust",
      label: "GP LTV / customer",
      beauty: eco.gpLtv,
      combined: combinedGpLtv,
      delta: gpLtvLife,
      format: "inr",
    },
    {
      key: "cac",
      label: "Visit CAC / customer",
      beauty: eco.cac,
      combined: eco.cac,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "sampCust",
      label: "Sampling / customer",
      beauty: eco.samplingPerCustomer,
      combined: eco.samplingPerCustomer,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "netCust",
      label: "Network / customer",
      beauty: eco.networkPerCustomer,
      combined: eco.networkPerCustomer,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "contrib",
      label: "Contribution / customer",
      beauty: eco.contributionPerCustomer,
      combined: eco.contributionPerCustomer + gpLtvLife,
      delta: gpLtvLife,
      format: "inr",
      strong: true,
    },
    {
      key: "ltvcac",
      label: "LTV / CAC",
      beauty: eco.ltvCac,
      combined: combinedLtvCac,
      delta:
        Number.isFinite(combinedLtvCac) && Number.isFinite(eco.ltvCac)
          ? combinedLtvCac - eco.ltvCac
          : NaN,
      format: "x",
    },
    {
      key: "pnlOrder",
      label: "P&L / beauty order",
      beauty: per(beautyPnl, orders),
      combined: per(combinedPnl, orders),
      delta: per(lifeGp, orders),
      format: "inr",
    },
    {
      key: "cpo",
      label: "Network ₹ / order",
      beauty: beauty.networkCpo,
      combined: beauty.networkCpo,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "aov",
      label: "Beauty AOV (consult order)",
      beauty: eco.consultAov,
      combined: eco.consultAov,
      delta: 0,
      format: "inr",
      unchanged: true,
    },
    {
      key: "lifeAov",
      label: "Handbag ticket",
      beauty: NaN,
      combined: lifestyle.blendedAov,
      delta: lifestyle.blendedAov,
      format: "inr",
    },
    {
      key: "attach",
      label: "Handbags / consult",
      beauty: 0,
      combined: lifestyle.attachPerConsult,
      delta: lifestyle.attachPerConsult,
      format: "num",
    },
  ];

  return {
    pnl,
    units,
    beautyPnl,
    combinedPnl,
    lift: beauty.feasible ? lifeGp : NaN,
    customers,
  };
}

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
  const eco = customerEconomics(commercial, { ...params, D: beauty.orders }, beauty.networkCpo);
  const combinedPnl = (beauty.feasible ? beauty.pnl : 0) + lifestyle.gp;
  return {
    beauty,
    lifestyle,
    eco,
    combinedPnl,
    combinedRevenue: beauty.revenue + lifestyle.revenue,
    combinedGp: beauty.grossProfit + lifestyle.gp,
    combinedCogs: beauty.cogs + lifestyle.cogs,
    compare: lifestyleCompare(beauty, lifestyle, eco),
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
