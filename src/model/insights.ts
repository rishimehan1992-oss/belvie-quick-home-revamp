import { optimise, solve } from "./solver";
import type { Insight, SolverParams, SolveResult } from "./types";

function lakhs(x: number): string {
  return (x / 1e5).toFixed(2);
}

export function getInsights(params: SolverParams, result: SolveResult): Insight[] {
  const insights: Insight[] = [];
  const { best } = result;
  const probe = solve(Math.max(best ? best.S : 8, 1), params);

  if (!probe.slaOK) {
    insights.push({
      severity: "critical",
      text: `Replenishment breaks: furthest spoke is ${Math.round(probe.lineHaul)} min from the hub against a ${params.Lam} min limit. Run hub waves off-peak or add a second hub.`,
    });
  }

  if (!probe.routeOK) {
    insights.push({
      severity: "critical",
      text: `At ${params.mkVan} min/km not even one drop fits a ${params.Tslot} min slot. Raise slot length or orders per society.`,
    });
  }

  if (best && params.k === 1) {
    const b3 = optimise({ ...params, k: 3 }).best;
    if (b3) {
      const delta = best.total - b3.total;
      const pct = Math.round((best.rt / best.cycle) * 100);
      insights.push({
        severity: "critical",
        text: `At k=1 the advisor spends ${pct}% of her paid day travelling to and from the spoke. Moving to k=3 saves ₹${lakhs(delta)}L a month (₹${((delta * 12) / 1e7).toFixed(2)} Cr a year) with no capex.`,
      });
    }
  }

  if (best && best.cpo > 500) {
    insights.push({
      severity: "critical",
      text: `Network cost is ₹${Math.round(best.cpo)} per order — over 17% of a ₹2,800 AOV before COGS. Check against CM1 before treating this as a plan.`,
    });
  }

  if (best && best.S > best.minS) {
    insights.push({
      severity: "info",
      text: `Spoke count is cost-driven here, not capacity-driven: the floor is ${best.minS} but travel savings justify ${best.S}. Happens when advisor travel is slow and k is low.`,
    });
  }

  if (best && best.S === best.minS) {
    insights.push({
      severity: "info",
      text: `Spoke count is set by the capacity floor (${best.minS}) — cost alone would build fewer. κ_S is driving your answer.`,
    });
  }

  return insights;
}
