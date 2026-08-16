"use client";

import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { OpsSimCanvas } from "@/components/OpsSimCanvas";
import { useModel } from "@/components/ModelProvider";
import { integer } from "@/model/format";
import { buildOpsScenes } from "@/model/opsSim";

export function OpsSimApp() {
  const { params } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(40);
  const [tMin, setTMin] = useState(0);

  const scenes = useMemo(() => buildOpsScenes(params), [params]);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.08);
      last = now;
      setTMin((t) => t + dt * speed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Simulate
          </h1>
          <p className="mt-0.5 text-[13.5px] leading-[1.45] text-gray">
            One looping kit cycle and a van tour. Scooters leave a spoke, sit in the home for the
            consult, then return to rebuild the kit. Last-mile vans tour drops from the spoke.
            The green-grey van restocks spokes from the hub. Small is ~100 orders/day; large is
            this session&apos;s book at S*.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="simulate" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 flex flex-wrap items-center gap-3 rounded-[10px] border border-line bg-white px-3.5 py-2.5">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="rounded-full border border-charcoal bg-charcoal px-3 py-1.5 text-[12.5px] text-white"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => setTMin(0)}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
        >
          Reset
        </button>
        <label className="flex min-w-[180px] flex-1 items-center gap-2 text-[12px] text-gray">
          Speed
          <input
            type="range"
            min={8}
            max={120}
            step={4}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="tabular-nums text-charcoal">{speed}×</span>
        </label>
        <div className="text-[12px] text-gray">
          Clock <span className="font-serif text-charcoal tabular-nums">{Math.round(tMin)} min</span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
        <Stat label="Kit cycle" value={`${Math.round(scenes.large.cycle)} min`} sub={`k=${params.k} · travel ${Math.round(scenes.large.rt)} min`} />
        <Stat label="In-home" value={`${params.Tc} min`} sub={`${params.Tkit} min kit · ${params.tintra} min home-to-home`} />
        <Stat label="Last-mile slot" value={`${params.Tslot} min`} sub={`${scenes.large.n} drops / trip at S*`} />
        <Stat label="Hub → rim" value={`${Math.round(scenes.large.lineHaul)} min`} sub="line-haul envelope · restock van uses 0.55 of that" />
      </div>

      <div className="grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2">
        <Panel scene={scenes.small} tMin={tMin} />
        <Panel scene={scenes.large} tMin={tMin} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-gray">
        <Legend swatch="#2B2622" label="Hub" />
        <Legend swatch="#BA5D42" label="Spoke · scooter" />
        <Legend swatch="#C9BEB6" label="Home" />
        <Legend swatch="#4A7A5C" label="Last-mile van" />
        <Legend swatch="#8C9A8E" label="Hub → spoke restock" />
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">What is drawn:</b> the same cycle the optimiser costs —
        travel {Math.round(scenes.large.rt)} min, kit {params.Tkit} min, {params.k} × {params.Tc} min
        in-home
        {params.k > 1 ? `, ${params.k - 1} × ${params.tintra} min home-to-home` : ""}. Homes are a
        uniform sample assigned to the nearest spoke, not live GPS. Vehicle counts are a stage
        cast (one scooter per spoke, vans on a subset) so the motion stays readable — not the
        full paid headcount of {integer(scenes.large.best.N)}. Line-haul here is the restock
        envelope, not last-mile cost.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function Panel({
  scene,
  tMin,
}: {
  scene: ReturnType<typeof buildOpsScenes>["small"];
  tMin: number;
}) {
  return (
    <section className="rounded-[10px] border border-line bg-white px-3.5 pt-3 pb-3">
      <h2 className="m-0 font-serif text-base font-normal text-charcoal">{scene.title}</h2>
      <p className="mb-2 mt-0.5 text-[11.5px] text-gray">{scene.caption}</p>
      <OpsSimCanvas scene={scene} tMin={tMin} />
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray">
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em]">Spokes</div>
          <div className="font-serif text-[16px] text-charcoal">{scene.S}</div>
        </div>
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em]">One way</div>
          <div className="font-serif text-[16px] text-charcoal">{scene.dBar.toFixed(1)} km</div>
        </div>
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.1em]">Cycle</div>
          <div className="font-serif text-[16px] text-charcoal">{Math.round(scene.cycle)} min</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[9px] border border-line bg-white px-3 py-2">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-gray">{label}</div>
      <div className="mt-0.5 font-serif text-[20px] leading-[1.2] text-charcoal tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-gray">{sub}</div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-sm" style={{ background: swatch }} />
      {label}
    </span>
  );
}
