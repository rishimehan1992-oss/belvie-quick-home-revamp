import { dbar, normalise, optimise, solve, tourMinutes } from "./solver";
import type { Params, Solution, SolverParams } from "./types";

export type Vec = { x: number; y: number };

export type SimNode = {
  id: string;
  x: number;
  y: number;
  kind: "hub" | "spoke" | "home";
  spokeId?: number;
};

export type AgentKind = "advisor" | "vanLastMile" | "vanLineHaul";

export type AgentPhase =
  | "kit"
  | "toHome"
  | "consult"
  | "between"
  | "toSpoke"
  | "tour"
  | "handover"
  | "haulOut"
  | "haulBack";

export type AgentSeg = {
  t0: number;
  t1: number;
  from: Vec;
  to: Vec;
  phase: AgentPhase;
  label: string;
};

export type SimAgent = {
  id: string;
  kind: AgentKind;
  spokeId: number;
  segs: AgentSeg[];
  period: number;
  offset: number;
};

export type AgentPose = {
  id: string;
  kind: AgentKind;
  x: number;
  y: number;
  heading: number;
  phase: AgentPhase;
  label: string;
};

export type OpsScene = {
  id: "small" | "large";
  title: string;
  caption: string;
  D: number;
  S: number;
  H: number;
  k: number;
  cycle: number;
  rt: number;
  dBar: number;
  n: number;
  Tslot: number;
  lineHaul: number;
  cityR: number;
  nodes: SimNode[];
  agents: SimAgent[];
  best: Solution;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

function hypot(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

function nearestSpoke(x: number, y: number, spokes: Vec[]): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < spokes.length; i++) {
    const d = hypot(x, y, spokes[i].x, spokes[i].y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function placeSpokes(S: number, cityR: number): Vec[] {
  const ring = cityR * 0.55;
  return Array.from({ length: S }, (_, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / S;
    return { x: ring * Math.cos(ang), y: ring * Math.sin(ang) };
  });
}

function placeHomes(
  spokes: Vec[],
  cityR: number,
  perSpoke: number,
  seed: number,
): { x: number; y: number; spokeId: number }[] {
  const rand = rng(seed);
  const homes: { x: number; y: number; spokeId: number }[] = [];
  for (let s = 0; s < spokes.length; s++) {
    let placed = 0;
    let tries = 0;
    while (placed < perSpoke && tries < 4000) {
      tries += 1;
      const ang = rand() * Math.PI * 2;
      const r = cityR * Math.sqrt(rand());
      const x = r * Math.cos(ang);
      const y = r * Math.sin(ang);
      if (Math.hypot(x, y) > cityR * 0.96) continue;
      const owner = nearestSpoke(x, y, spokes);
      if (owner !== s) continue;
      if (hypot(x, y, spokes[s].x, spokes[s].y) < cityR * 0.06) continue;
      homes.push({ x, y, spokeId: s });
      placed += 1;
    }
    if (placed === 0) {
      const ang = -Math.PI / 2 + (2 * Math.PI * s) / spokes.length;
      homes.push({
        x: spokes[s].x + cityR * 0.18 * Math.cos(ang + 0.4),
        y: spokes[s].y + cityR * 0.18 * Math.sin(ang + 0.4),
        spokeId: s,
      });
    }
  }
  return homes;
}

function periodOf(segs: AgentSeg[]): number {
  return segs.length ? segs[segs.length - 1].t1 : 1;
}

function advisorSegs(
  spoke: Vec,
  homes: Vec[],
  p: SolverParams,
  rt: number,
): AgentSeg[] {
  const segs: AgentSeg[] = [];
  let t = 0;
  segs.push({
    t0: t,
    t1: t + p.Tkit,
    from: spoke,
    to: spoke,
    phase: "kit",
    label: "Kit rebuild at spoke",
  });
  t += p.Tkit;
  const k = Math.max(1, Math.round(p.k));
  const picks = Array.from({ length: k }, (_, i) => homes[i % Math.max(homes.length, 1)] ?? {
    x: spoke.x + 1,
    y: spoke.y,
  });
  for (let i = 0; i < k; i++) {
    const dest = picks[i];
    const from = i === 0 ? spoke : picks[i - 1];
    const travel = i === 0 ? rt / 2 : p.tintra;
    const phase = i === 0 ? "toHome" : "between";
    const label = i === 0 ? "Spoke → home" : "Home → home";
    segs.push({ t0: t, t1: t + travel, from, to: dest, phase, label });
    t += travel;
    segs.push({
      t0: t,
      t1: t + p.Tc,
      from: dest,
      to: dest,
      phase: "consult",
      label: `In-home consult · ${p.Tc} min`,
    });
    t += p.Tc;
  }
  segs.push({
    t0: t,
    t1: t + rt / 2,
    from: picks[k - 1],
    to: spoke,
    phase: "toSpoke",
    label: "Home → spoke",
  });
  return segs;
}

function vanTourSegs(
  spoke: Vec,
  homes: Vec[],
  n: number,
  a: number,
  p: SolverParams,
): AgentSeg[] {
  const stops = Math.max(1, Math.min(n, homes.length));
  const tour = tourMinutes(stops, a, p);
  const pause = stops * p.thd;
  const drive = Math.max(tour - pause, 1);
  const leg = drive / (stops + 1);
  const path = [spoke, ...homes.slice(0, stops), spoke];
  const segs: AgentSeg[] = [];
  let t = 0;
  for (let i = 0; i < path.length - 1; i++) {
    segs.push({
      t0: t,
      t1: t + leg,
      from: path[i],
      to: path[i + 1],
      phase: "tour",
      label: i === path.length - 2 ? "Van back to spoke" : `Van to drop ${i + 1} / ${stops}`,
    });
    t += leg;
    if (i < stops) {
      segs.push({
        t0: t,
        t1: t + p.thd,
        from: path[i + 1],
        to: path[i + 1],
        phase: "handover",
        label: `Handover · ${p.thd} min`,
      });
      t += p.thd;
    }
  }
  return segs;
}

function haulCircuit(hub: Vec, spokes: Vec[], oneWayMin: number): AgentSeg[] {
  const segs: AgentSeg[] = [];
  let t = 0;
  for (let s = 0; s < spokes.length; s++) {
    segs.push({
      t0: t,
      t1: t + oneWayMin,
      from: hub,
      to: spokes[s],
      phase: "haulOut",
      label: `Hub → spoke ${s + 1} restock`,
    });
    t += oneWayMin;
    segs.push({
      t0: t,
      t1: t + oneWayMin,
      from: spokes[s],
      to: hub,
      phase: "haulBack",
      label: `Spoke ${s + 1} → hub`,
    });
    t += oneWayMin;
  }
  return segs;
}

export function poseAt(agent: SimAgent, tMin: number): AgentPose {
  const t = ((tMin + agent.offset) % agent.period + agent.period) % agent.period;
  const seg = agent.segs.find((s) => t >= s.t0 && t < s.t1) ?? agent.segs[agent.segs.length - 1];
  const span = Math.max(seg.t1 - seg.t0, 1e-6);
  const u = Math.min(1, Math.max(0, (t - seg.t0) / span));
  const x = seg.from.x + (seg.to.x - seg.from.x) * u;
  const y = seg.from.y + (seg.to.y - seg.from.y) * u;
  const heading = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
  return {
    id: agent.id,
    kind: agent.kind,
    x,
    y,
    heading: Number.isFinite(heading) ? heading : 0,
    phase: seg.phase,
    label: seg.label,
  };
}

export function buildOpsScene(
  params: Params,
  id: "small" | "large",
  D: number,
  homesPerSpoke: number,
): OpsScene {
  const p = normalise({ ...params, D });
  const result = optimise(p);
  const best =
    result.best ??
    solve(Math.max(result.rows[0]?.minS ?? 3, 2), p);
  const cityR = Math.sqrt(p.A / Math.PI);
  const spokes = placeSpokes(best.S, cityR);
  const homes = placeHomes(spokes, cityR, homesPerSpoke, id === "small" ? 11 : 29);
  const hub = { x: 0, y: 0 };
  const nodes: SimNode[] = [
    { id: "hub", x: 0, y: 0, kind: "hub" },
    ...spokes.map((s, i) => ({ id: `spoke-${i}`, x: s.x, y: s.y, kind: "spoke" as const, spokeId: i })),
    ...homes.map((h, i) => ({
      id: `home-${i}`,
      x: h.x,
      y: h.y,
      kind: "home" as const,
      spokeId: h.spokeId,
    })),
  ];

  const agents: SimAgent[] = [];
  for (let s = 0; s < best.S; s++) {
    const spokeHomes = homes.filter((h) => h.spokeId === s);
    const segs = advisorSegs(spokes[s], spokeHomes, p, best.rt);
    agents.push({
      id: `adv-${s}`,
      kind: "advisor",
      spokeId: s,
      segs,
      period: periodOf(segs),
      offset: (best.cycle * s) / Math.max(best.S, 1),
    });
  }

  const vanSpokes =
    best.S <= 6 ? [...Array(best.S).keys()] : [...Array(best.S).keys()].filter((i) => i % 2 === 0);
  for (const s of vanSpokes) {
    const spokeHomes = homes.filter((h) => h.spokeId === s);
    const segs = vanTourSegs(spokes[s], spokeHomes, best.n, best.a, p);
    agents.push({
      id: `van-${s}`,
      kind: "vanLastMile",
      spokeId: s,
      segs,
      period: periodOf(segs),
      offset: (p.Tslot * s) / Math.max(vanSpokes.length, 1),
    });
  }

  const haulMin = best.lineHaul * 0.55;
  const haul = haulCircuit(hub, spokes, haulMin);
  agents.push({
    id: "haul-0",
    kind: "vanLineHaul",
    spokeId: 0,
    segs: haul,
    period: periodOf(haul),
    offset: 0,
  });

  const ordersDay = D / p.ddel;
  return {
    id,
    title: id === "small" ? "Small scale" : "Large scale",
    caption:
      id === "small"
        ? `${Math.round(ordersDay)} orders / day · ${best.S} spokes · long spoke↔home hops`
        : `${Math.round(ordersDay)} orders / day · S* ${best.S} · short hops, more vehicles`,
    D,
    S: best.S,
    H: best.H,
    k: p.k,
    cycle: best.cycle,
    rt: best.rt,
    dBar: dbar(p.A, best.S, p.tau),
    n: best.n,
    Tslot: p.Tslot,
    lineHaul: best.lineHaul,
    cityR,
    nodes,
    agents,
    best,
  };
}

export function buildOpsScenes(params: Params): { small: OpsScene; large: OpsScene } {
  const smallD = Math.max(params.ddel * 100, 2000);
  return {
    small: buildOpsScene(params, "small", smallD, 5),
    large: buildOpsScene(params, "large", params.D, 8),
  };
}
