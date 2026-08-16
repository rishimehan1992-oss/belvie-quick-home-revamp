import { normalise, optimise } from "./solver";
import type { Params, Solution } from "./types";

export const ADVISOR_SLICE_COLORS = {
  travel: "#BA5D42",
  consult: "#2B2622",
  kit: "#8C9A8E",
  intra: "#C4A574",
  admin: "#6B6560",
  slack: "#C9BEB6",
} as const;

export type AdvisorSliceId = keyof typeof ADVISOR_SLICE_COLORS;

export type AdvisorSlice = {
  id: AdvisorSliceId;
  label: string;
  minutesDay: number;
  month: number;
  perOrder: number;
  perVisit: number;
  color: string;
};

export type AdvisorBreakdown = {
  productiveMin: number;
  shiftMin: number;
  adminMin: number;
  cycleMin: number;
  cyclesDay: number;
  requiredFte: number;
  paidFte: number;
  utilisation: number;
  travelShareCycle: number;
  slices: AdvisorSlice[];
  advisorPerOrder: number;
  advisorPerVisit: number;
  visitCacPerOrder: number;
  visitCacPerVisit: number;
};

const LABELS: Record<AdvisorSliceId, string> = {
  travel: "Spoke ↔ home travel",
  consult: "In-home consult",
  kit: "Kit rebuild at spoke",
  intra: "Home to home",
  admin: "Daily admin",
  slack: "Paid idle · last FTE",
};

function per(month: number, den: number): number {
  return den > 0 && Number.isFinite(month) ? month / den : NaN;
}

export function advisorBreakdown(
  best: Solution,
  params: Params,
  consults: number,
  visitCost: number,
): AdvisorBreakdown {
  const shiftMin = params.Tshift;
  const adminMin = params.Tadmin;
  const productiveMin = Math.max(shiftMin - adminMin, 0);
  const cycleMin = best.cycle;
  const cyclesDay = cycleMin > 0 ? productiveMin / cycleMin : 0;

  const timeDay = {
    travel: cyclesDay * best.rt,
    consult: cyclesDay * params.k * params.Tc,
    kit: cyclesDay * params.Tkit,
    intra: cyclesDay * Math.max(params.k - 1, 0) * params.tintra,
    admin: adminMin,
  };

  const requiredFte =
    best.cday > 0 && params.dadv > 0 ? consults / (best.cday * params.dadv) : Infinity;
  const paidFte = best.N;
  const utilisation =
    paidFte > 0 && Number.isFinite(requiredFte) ? Math.min(requiredFte / paidFte, 1) : 0;

  const slackMonth =
    Number.isFinite(requiredFte) && Number.isFinite(best.Cadv)
      ? Math.max(paidFte - requiredFte, 0) * params.w
      : 0;
  const utilisedMonth = Number.isFinite(best.Cadv) ? Math.max(best.Cadv - slackMonth, 0) : 0;
  const timeTotal = Object.values(timeDay).reduce((s, v) => s + v, 0);

  const workIds = ["travel", "consult", "kit", "intra", "admin"] as const;
  const slices: AdvisorSlice[] = workIds.map((id) => {
    const share = timeTotal > 0 ? timeDay[id] / timeTotal : 0;
    const month = utilisedMonth * share;
    return {
      id,
      label: LABELS[id],
      minutesDay: timeDay[id],
      month,
      perOrder: per(month, params.D),
      perVisit: per(month, consults),
      color: ADVISOR_SLICE_COLORS[id],
    };
  });
  slices.push({
    id: "slack",
    label: LABELS.slack,
    minutesDay: 0,
    month: slackMonth,
    perOrder: per(slackMonth, params.D),
    perVisit: per(slackMonth, consults),
    color: ADVISOR_SLICE_COLORS.slack,
  });

  return {
    productiveMin,
    shiftMin,
    adminMin,
    cycleMin,
    cyclesDay,
    requiredFte,
    paidFte,
    utilisation,
    travelShareCycle: cycleMin > 0 ? best.rt / cycleMin : 0,
    slices,
    advisorPerOrder: per(best.Cadv, params.D),
    advisorPerVisit: per(best.Cadv, consults),
    visitCacPerOrder: per(consults * visitCost, params.D),
    visitCacPerVisit: visitCost,
  };
}

export type AdvisorVolumePoint = {
  D: number;
  S: number | null;
  N: number | null;
  cday: number | null;
  travel: number | null;
  advisorPerOrder: number | null;
  visitCacPerOrder: number | null;
  consultsPerAdvisor: number | null;
  feasible: boolean;
};

const VOLUME_GRID = [
  2000, 4000, 6000, 8000, 10000, 15000, 20000, 25000, 35000, 50000, 75000,
];

export function advisorCostVsVolume(params: Params, visitCost: number): AdvisorVolumePoint[] {
  const volumes = new Set(VOLUME_GRID.filter((d) => d >= 1000));
  if (Number.isFinite(params.D) && params.D >= 1000) volumes.add(Math.round(params.D));

  const rho = params.rho / 100;
  const phi = params.phi / 100;
  const visitShare = phi > 0 ? (1 - rho) / phi : Infinity;
  const visitCacPerOrder = Number.isFinite(visitShare) ? visitCost * visitShare : NaN;
  const empty = {
    S: null,
    N: null,
    cday: null,
    travel: null,
    advisorPerOrder: null,
    visitCacPerOrder: Number.isFinite(visitCacPerOrder) ? visitCacPerOrder : null,
    consultsPerAdvisor: null,
    feasible: false,
  };

  return [...volumes]
    .sort((a, b) => a - b)
    .map((D) => {
      const { best } = optimise(normalise({ ...params, D }));
      if (!best || !Number.isFinite(best.Cadv) || !(best.N > 0)) {
        return { D, ...empty };
      }
      const consults = Number.isFinite(visitShare) ? D * visitShare : NaN;
      return {
        D,
        S: best.S,
        N: best.N,
        cday: best.cday,
        travel: best.rt,
        advisorPerOrder: best.Cadv / D,
        visitCacPerOrder: Number.isFinite(visitCacPerOrder) ? visitCacPerOrder : null,
        consultsPerAdvisor: Number.isFinite(consults) ? consults / best.N : null,
        feasible: true,
      };
    });
}
