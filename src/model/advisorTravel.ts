import { dbar } from "./solver";
import type { Params, Solution } from "./types";

export type AdvisorTravelPoint = {
  S: number;
  catchment: number;
  dBar: number;
  rtKm: number;
  travelMin: number;
  cycleMin: number;
  travelDayMin: number;
  kmDay: number;
  consultMin: number;
  kitMin: number;
  intraMin: number;
  cday: number;
  feasible: boolean;
  isBest: boolean;
};

export type SpokeStep = {
  fromS: number;
  toS: number;
  dBarFrom: number;
  dBarTo: number;
  kmSaved: number;
  minSaved: number;
  pctShorter: number;
};

export function advisorTravelBySpoke(
  rows: Solution[],
  params: Params,
  bestS: number | null,
): AdvisorTravelPoint[] {
  const productive = Math.max(params.Tshift - params.Tadmin, 0);
  const consultMin = params.k * params.Tc;
  const kitMin = params.Tkit;
  const intraMin = Math.max(params.k - 1, 0) * params.tintra;

  return rows
    .filter((r) => r.S >= 1 && r.S <= 20 && Number.isFinite(r.rt) && r.rt > 0)
    .map((r) => {
      const dBar = dbar(params.A, r.S, params.tau);
      const rtKm = 2 * dBar;
      const cyclesDay = r.cycle > 0 ? productive / r.cycle : 0;
      return {
        S: r.S,
        catchment: params.A / r.S,
        dBar,
        rtKm,
        travelMin: r.rt,
        cycleMin: r.cycle,
        travelDayMin: cyclesDay * r.rt,
        kmDay: cyclesDay * rtKm,
        consultMin,
        kitMin,
        intraMin,
        cday: r.cday,
        feasible: r.feasible,
        isBest: bestS != null && r.S === bestS,
      };
    });
}

export function spokeStep(from: AdvisorTravelPoint, to: AdvisorTravelPoint): SpokeStep {
  return {
    fromS: from.S,
    toS: to.S,
    dBarFrom: from.dBar,
    dBarTo: to.dBar,
    kmSaved: from.rtKm - to.rtKm,
    minSaved: from.travelMin - to.travelMin,
    pctShorter: from.dBar > 0 ? 1 - to.dBar / from.dBar : 0,
  };
}
