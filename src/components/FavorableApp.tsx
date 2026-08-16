"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { ZoneHeatmap } from "@/components/ZoneHeatmap";
import {
  COMBOS,
  LEVER_IDS,
  LEVER_META,
  ZONE_COLORS,
  cellAt,
  comboIdFor,
  describeHold,
  heldLevers,
  holdFromSession,
  minProfitableX,
  minProfitableY,
  nearestOnScale,
  scaleOrdersMonth,
  sweepFavorable,
  type FavorableCell,
  type HoldState,
  type LeverId,
  type SweepSpec,
} from "@/model/favorable";
import { CITY_TARGET_DAY } from "@/model/growth";
import { integer, lakhs } from "@/model/format";
import { rhoFromNonConsultsPerConsult } from "@/model/pnl";

const selectClass =
  "w-full rounded-[6px] border border-line bg-white px-2 py-1.5 text-[12.5px] text-charcoal focus:border-terracotta focus:outline-2 focus:outline-offset-1 focus:outline-terracotta";

export function FavorableApp() {
  const { params, dispatch, commercial, setCommercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);
  const [scale, setScale] = useState<"city" | "session">("city");
  const [spec, setSpec] = useState<SweepSpec>(COMBOS[0].spec);
  const [hold, setHold] = useState<HoldState>(() => holdFromSession(params, commercial));
  const [lockNcAov, setLockNcAov] = useState(true);
  const [picked, setPicked] = useState<FavorableCell | null>(null);

  const sessionHold = useMemo(() => holdFromSession(params, commercial), [params, commercial]);
  const scaleOrders = scale === "city" ? scaleOrdersMonth(params) : params.D;
  const scaleDay = scaleOrders / params.ddel;
  const comboId = comboIdFor(spec);
  const holds = heldLevers(spec);

  const grid = useMemo(
    () => sweepFavorable(params, hold, scaleOrders, spec, lockNcAov),
    [params, hold, scaleOrders, spec, lockNcAov],
  );

  const markX = nearestOnScale(grid.xs, hold[spec.x]);
  const markY = nearestOnScale(grid.ys, hold[spec.y]);
  const markFacet = spec.facet ? nearestOnScale(LEVER_META[spec.facet].scale, hold[spec.facet]) : null;
  const here = cellAt(grid, markX, markY, markFacet);
  const hereSlice =
    grid.slices.find((s) => s.facet === (here?.facet ?? markFacet)) ?? grid.slices[0];
  const beX = hereSlice ? minProfitableX(hereSlice) : null;
  const beY = hereSlice ? minProfitableY(hereSlice, markX) : null;
  const best = grid.best;
  const focus = picked ?? here;

  function setAxis(which: "x" | "y" | "facet", value: string) {
    setPicked(null);
    setSpec((prev) => {
      const next: SweepSpec = { ...prev };
      if (which === "facet") {
        next.facet = value === "" ? null : (value as LeverId);
        return next;
      }
      next[which] = value as LeverId;
      if (next.x === next.y) {
        next.y = LEVER_IDS.find((id) => id !== next.x && id !== next.facet) ?? "n";
      }
      if (next.facet === next.x || next.facet === next.y) next.facet = null;
      return next;
    });
  }

  function applyHold(next: HoldState) {
    setCommercial("aov", next.aov);
    setCommercial("nonConsultAov", next.nonConsultAov);
    setCommercial("visitCost", next.visitCost);
    setCommercial("samplingCost", next.samplingCost);
    setCommercial("gm", next.gm);
    dispatch({ type: "set", key: "k", value: next.k });
    dispatch({ type: "set", key: "phi", value: next.conversion });
    dispatch({ type: "set", key: "rho", value: rhoFromNonConsultsPerConsult(next.n) });
  }

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Favorable
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Step 4 — pick a combination, hold the rest, and read the green pocket. Click a cell
            to inspect or send it to P&L.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="favorable" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <div className="mb-3.5 rounded-[10px] border border-line bg-card px-3.5 py-3">
        <div className="grid gap-3 min-[720px]:grid-cols-2 min-[980px]:grid-cols-4">
          <Field label="Combination">
            <select
              className={selectClass}
              value={comboId}
              onChange={(e) => {
                const combo = COMBOS.find((c) => c.id === e.target.value);
                if (combo) {
                  setPicked(null);
                  setSpec(combo.spec);
                }
              }}
            >
              {comboId === "custom" ? <option value="custom">Custom</option> : null}
              {COMBOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Columns (X)">
            <select className={selectClass} value={spec.x} onChange={(e) => setAxis("x", e.target.value)}>
              {LEVER_IDS.map((id) => (
                <option key={id} value={id}>
                  {LEVER_META[id].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rows (Y)">
            <select className={selectClass} value={spec.y} onChange={(e) => setAxis("y", e.target.value)}>
              {LEVER_IDS.filter((id) => id !== spec.x).map((id) => (
                <option key={id} value={id}>
                  {LEVER_META[id].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Split into panels">
            <select
              className={selectClass}
              value={spec.facet ?? ""}
              onChange={(e) => setAxis("facet", e.target.value)}
            >
              <option value="">None — one map</option>
              {LEVER_IDS.filter((id) => id !== spec.x && id !== spec.y).map((id) => (
                <option key={id} value={id}>
                  {LEVER_META[id].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mb-0 mt-2 text-[11.5px] text-gray">
          {COMBOS.find((c) => c.id === comboId)?.hint ??
            "Custom pair. Held sliders stay at the values below."}{" "}
          Volume {integer(scaleDay)} / day · {integer(scaleOrders)} / month.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPicked(null);
              setScale("city");
            }}
            className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
              scale === "city" ? "border-charcoal bg-charcoal text-white" : "border-line bg-white text-gray"
            }`}
          >
            Mature city · {CITY_TARGET_DAY.toLocaleString("en-IN")}/day
          </button>
          <button
            type="button"
            onClick={() => {
              setPicked(null);
              setScale("session");
            }}
            className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
              scale === "session"
                ? "border-charcoal bg-charcoal text-white"
                : "border-line bg-white text-gray"
            }`}
          >
            This P&L volume
          </button>
          <button
            type="button"
            onClick={() => setHold(sessionHold)}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Reset holds to P&L
          </button>
        </div>
        {spec.x === "aov" || spec.y === "aov" ? (
          <label className="mt-2 flex items-center gap-2 text-[12px] text-charcoal">
            <input
              type="checkbox"
              checked={lockNcAov}
              onChange={(e) => {
                setPicked(null);
                setLockNcAov(e.target.checked);
              }}
            />
            Keep non-consult AOV in proportion to consult AOV when AOV is swept
          </label>
        ) : null}
      </div>

      {holds.length ? (
        <div className="mb-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
            Held while you sweep
          </div>
          <div className="grid gap-x-4 gap-y-2 min-[640px]:grid-cols-2 min-[980px]:grid-cols-3">
            {holds.map((id) => (
              <HoldSlider
                key={id}
                id={id}
                value={hold[id]}
                onChange={(value) => setHold((prev) => ({ ...prev, [id]: value }))}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
        <Stat
          label="Held point on this map"
          value={here?.pnl.feasible ? `₹${lakhs(here.pnl.pnl)}L` : "—"}
          sub={`${LEVER_META[spec.x].format(markX)} · ${LEVER_META[spec.y].format(markY)}${
            spec.facet ? ` · ${LEVER_META[spec.facet].short} ${LEVER_META[spec.facet].format(markFacet ?? 0)}` : ""
          }`}
          tone={here?.pnl.feasible && here.pnl.pnl >= 0 ? "good" : "bad"}
        />
        <Stat
          label="Best pocket"
          value={best ? `₹${lakhs(best.pnl.pnl)}L` : "—"}
          sub={
            best
              ? `${LEVER_META[spec.x].format(best.x)} · ${LEVER_META[spec.y].format(best.y)}${
                  spec.facet && best.facet != null
                    ? ` · ${LEVER_META[spec.facet].format(best.facet)}`
                    : ""
                }`
              : "no feasible cell"
          }
        />
        <Stat
          label={`Break-even ${LEVER_META[spec.x].short}`}
          value={beX != null ? `≥ ${LEVER_META[spec.x].format(beX)}` : "none in range"}
          sub={
            beY != null
              ? `at this ${LEVER_META[spec.x].short}, ${LEVER_META[spec.y].short} ≥ ${LEVER_META[spec.y].format(beY)}`
              : `this ${LEVER_META[spec.x].short} is not green for any ${LEVER_META[spec.y].short}`
          }
        />
        <Stat
          label="Green share"
          value={`${Math.round(grid.greenShare * 100)}%`}
          sub="of feasible cells on this combination"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-gray">
        {(
          [
            ["deep-red", "heavy loss"],
            ["red", "loss"],
            ["amber", "thin / zero"],
            ["green", "profit"],
            ["deep-green", "strong"],
            ["infeasible", "no network"],
          ] as const
        ).map(([z, label]) => (
          <span key={z} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: ZONE_COLORS[z] }} />
            {label}
          </span>
        ))}
        <span className="text-charcoal">· ₹ lakh / month · ring is the held point</span>
      </div>

      <div
        className={`grid grid-cols-1 gap-3.5 ${
          grid.slices.length > 1 ? "min-[900px]:grid-cols-2" : ""
        }`}
      >
        {grid.slices.map((slice) => (
          <ZoneHeatmap
            key={String(slice.facet)}
            slice={slice}
            xs={grid.xs}
            ys={grid.ys}
            xId={spec.x}
            yId={spec.y}
            maxAbs={grid.maxAbs}
            markX={picked && picked.facet === slice.facet ? picked.x : markX}
            markY={picked && picked.facet === slice.facet ? picked.y : markY}
            compact={grid.slices.length > 1}
            onPick={setPicked}
          />
        ))}
      </div>

      {focus ? (
        <div className="mt-3.5 rounded-[10px] border border-line bg-white px-3.5 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
                {picked ? "Selected cell" : "Held cell"}
              </div>
              <div className="mt-1 font-serif text-[18px] text-charcoal">
                {focus.pnl.feasible ? `₹${lakhs(focus.pnl.pnl)}L / month` : "Infeasible network"}
              </div>
              <p className="mb-0 mt-1 text-[12px] leading-[1.45] text-gray">
                {describeHold(focus.hold)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setHold(focus.hold);
                  applyHold(focus.hold);
                }}
                className="rounded-full border border-charcoal bg-charcoal px-3 py-1.5 text-[12px] text-white"
              >
                Apply to P&L
              </button>
              {best && (!picked || picked !== best) ? (
                <button
                  type="button"
                  onClick={() => {
                    setPicked(best);
                    setHold(best.hold);
                  }}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-gray hover:border-terracotta hover:text-terracotta"
                >
                  Jump to best
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        <b className="text-charcoal">Reading:</b> each cell re-solves the city network at the
        scale volume. Axes and the optional split are the swept levers; everything else stays at
        the held values — they do not change P&L until you apply. Mix still changes consults, so
        visit and sampling cash move when n or conversion is swept. Numbers are ₹ lakh / month.
        All figures are planning estimates.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray">
      {label}
      <div className="mt-1 font-normal tracking-normal">{children}</div>
    </label>
  );
}

function HoldSlider({
  id,
  value,
  onChange,
}: {
  id: LeverId;
  value: number;
  onChange: (value: number) => void;
}) {
  const meta = LEVER_META[id];
  const min = Math.min(meta.scale[0], value);
  const max = Math.max(meta.scale[meta.scale.length - 1], value);
  const step = id === "n" ? 0.05 : id === "k" ? 1 : id === "conversion" || id === "gm" ? 1 : 10;

  return (
    <label className="block text-[12px] text-charcoal">
      <span className="flex justify-between gap-2">
        <span>{meta.label}</span>
        <span className="font-serif tabular-nums">{meta.format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer accent-terracotta"
      />
    </label>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "plain",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "plain" | "good" | "bad";
}) {
  const box =
    tone === "good"
      ? "border-good bg-good text-white"
      : tone === "bad"
        ? "border-bad bg-bad text-white"
        : "border-line bg-white text-charcoal";
  const inverted = tone !== "plain";
  return (
    <div className={`rounded-[9px] border px-3 py-2.5 ${box}`}>
      <div className={`text-[9.5px] font-bold uppercase tracking-[0.1em] ${inverted ? "text-white/80" : "text-gray"}`}>
        {label}
      </div>
      <div className={`mt-0.5 font-serif text-[22px] leading-[1.15] ${inverted ? "text-white" : "text-charcoal"}`}>
        {value}
      </div>
      <div className={`mt-0.5 text-[11px] ${inverted ? "text-white/75" : "text-gray"}`}>{sub}</div>
    </div>
  );
}
