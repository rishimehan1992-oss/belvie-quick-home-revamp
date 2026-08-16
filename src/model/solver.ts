import type { Params, Solution, SolveResult, SolverParams } from "./types";

export function normalise(params: Params): SolverParams {
  return {
    ...params,
    rho: params.rho / 100,
    phi: params.phi / 100,
    coc: params.coc / 100,
  };
}

export function eac(P: number, r: number, years: number): number {
  if (years <= 0) return 0;
  const rm = r / 12;
  const n = years * 12;
  return rm === 0 ? P / n : (P * rm) / (1 - Math.pow(1 + rm, -n));
}

export function dbar(A: number, S: number, tau: number): number {
  return 0.4 * Math.sqrt(A / S) * tau;
}

export function tourMinutes(n: number, a: number, p: SolverParams): number {
  const m = Math.max(n / p.qsoc, 1);
  const L = p.beta * Math.sqrt(m * a) * p.tau;
  return L * p.mkVan + n * p.thd + m * p.thst;
}

export function maxDrops(a: number, p: SolverParams): number {
  let best = 0;
  for (let n = 1; n <= 200; n++) {
    if (tourMinutes(n, a, p) <= p.Tslot) best = n;
    else break;
  }
  return best;
}

export function solve(S: number, p: SolverParams): Solution {
  const a = p.A / S;
  const ordersDay = p.D / p.ddel;
  const peakSpoke = (ordersDay / S) * p.peak;

  const d = dbar(p.A, S, p.tau);
  const rt = 2 * d * p.mkAdv;
  const cycle = rt + p.Tkit + p.k * p.Tc + (p.k - 1) * p.tintra;
  const cday = p.k * (p.Tshift - p.Tadmin) / cycle;
  const visits = (p.D * (1 - p.rho)) / p.phi;
  const N = cday > 0 ? Math.ceil(visits / (cday * p.dadv)) : Infinity;
  const Cadv = N * p.w;

  const n = maxDrops(a, p);
  const tripsDay = n > 0 ? ordersDay / n : Infinity;
  const Cdel = n > 0 ? tripsDay * p.ct * p.ddel : Infinity;

  const H = Math.max(Math.ceil(p.D / p.kapH), 1);
  const Cinf = H * p.fH + S * p.fS;
  const capexTotal = H * p.KH + S * p.KS;
  const Ccap = p.incCap
    ? H * eac(p.KH, p.coc, p.life) + S * eac(p.KS, p.coc, p.life)
    : 0;

  const capOK = peakSpoke <= p.kapS;
  const radius = Math.sqrt(p.A / Math.PI);
  const lineHaul = radius * p.tau * p.mkLine;
  const slaOK = lineHaul <= p.Lam;
  const routeOK = n > 0;

  const total = Cinf + Cadv + Cdel + Ccap;
  return {
    S,
    H,
    a,
    peakSpoke,
    ordersDaySpoke: ordersDay / S,
    rt,
    cycle,
    cday,
    N,
    n,
    tripsDay,
    cdelOrder: n > 0 ? p.ct / n : Infinity,
    Cinf,
    Cadv,
    Cdel,
    Ccap,
    capexTotal,
    total,
    cpo: total / p.D,
    capOK,
    slaOK,
    routeOK,
    lineHaul,
    feasible: capOK && routeOK,
    minS: Math.ceil((ordersDay * p.peak) / p.kapS),
  };
}

export function optimise(p: SolverParams, maxS = 28): SolveResult {
  const rows: Solution[] = [];
  for (let S = 1; S <= maxS; S++) rows.push(solve(S, p));
  const feasible = rows.filter((r) => r.feasible && Number.isFinite(r.total));
  const best = feasible.length
    ? feasible.reduce((a, b) => (b.total < a.total ? b : a))
    : null;
  return { rows, best };
}
