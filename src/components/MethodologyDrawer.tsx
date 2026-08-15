"use client";

import { useEffect, type ReactNode } from "react";

export function MethodologyDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close methodology"
        className="absolute inset-0 bg-charcoal/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="method-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-line bg-cream p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-terracotta">
              Methodology
            </div>
            <h2 id="method-title" className="mt-1 font-serif text-2xl font-normal text-charcoal">
              How the network is costed
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line bg-white px-2.5 py-1 text-sm text-gray hover:border-terracotta hover:text-terracotta"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 text-[13.5px] leading-[1.55] text-ink">
          <p>
            Demand is exogenous. The model chooses how cheaply to serve a fixed order volume over
            spoke counts S ∈ {"{1 … 28}"}. It is a cost-minimisation, not a profit-maximisation.
            Known approximation: consults/day allows fractional cycles, so an advisor can start a
            kit load she does not finish before the day ends. This slightly overstates productivity
            at high k.
          </p>

          <Section title="Advisor productivity">
            <pre className="overflow-x-auto rounded-md bg-white p-3 text-[12px] leading-relaxed text-charcoal">
{`d̄(S)        = 0.40 · τ · √(A / S)
travel(S)   = 2 · d̄(S) · minPerKmAdvisor
cycle(S,k)  = travel(S) + T_kit + k · T_consult + (k−1) · t_intra
consultsDay = k · (T_shift − T_admin) / cycle(S,k)
visitsMonth = D · (1 − ρ) / φ
N           = ceil( visitsMonth / (consultsDay · d_adv) )
C_advisor   = N · w`}
            </pre>
            <p className="mt-2 text-gray">
              0.40 · √(A/S) is the mean distance from a random point to the nearest of S uniformly
              spread facilities; τ converts straight-line to road distance.
            </p>
          </Section>

          <Section title="Delivery">
            <pre className="overflow-x-auto rounded-md bg-white p-3 text-[12px] leading-relaxed text-charcoal">
{`a(S)  = A / S
m(n)  = max(n / q_soc, 1)
L(n)  = β · √(m(n) · a(S)) · τ
time  = L(n) · minPerKmVan + n · θ_drop + m(n) · θ_stop`}
            </pre>
            <p className="mt-2 text-gray">
              n is the largest integer where time ≤ T_slot. Search from 1 upward and break on the
              first infeasible value. If n = 0 the configuration is infeasible.
            </p>
          </Section>

          <Section title="Infrastructure and capex">
            <pre className="overflow-x-auto rounded-md bg-white p-3 text-[12px] leading-relaxed text-charcoal">
{`H          = max( ceil(D / κ_H), 1 )
C_infra    = H · f_H + S · f_S
capexTotal = H · K_H + S · K_S
eac(P, r, years) uses monthly cost of capital
C_capex    = includeCapex ? H·eac(K_H) + S·eac(K_S) : 0
C_total(S) = C_infra + C_advisor + C_delivery + C_capex`}
            </pre>
          </Section>

          <Section title="Constraints">
            <ul className="list-disc space-y-1 pl-5 text-gray">
              <li>C1 Spoke capacity: (D / d_del / S) · π ≤ κ_S — per S; fail → row infeasible.</li>
              <li>C2 Van route fits the slot: n ≥ 1 — per S; fail → row infeasible.</li>
              <li>
                C3 Replenishment envelope: √(A/π) · τ · minPerKmLine ≤ Λ — not per-S. Surfaced as a
                blocking banner; the solution still renders. Fix by running hub waves off-peak or
                adding a second hub.
              </li>
            </ul>
          </Section>

          <Section title="Default parameters">
            <p className="text-gray">
              Orders 25,000 / month over 350 km²; reorder 35%; conversion 60%; k = 1 consult per kit
              load; advisor 8 min/km; van 6 min/km; spoke opex ₹2.25L; hub opex ₹7.5L; spoke
              capacity 130 orders/day; line-haul 2.7 min/km (off-peak). Capex is included in the
              objective at 12% cost of capital over 5 years unless you turn it off.
            </p>
          </Section>

          <Section title="What is excluded">
            <p className="text-gray">
              COGS, kit BOM and tester replacement, marketing/CAC, technology, corporate overhead,
              and statutory loading on advisor cost. All figures are planning estimates derived from
              the inputs, not observed operating data.
            </p>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 font-serif text-base font-normal text-charcoal">{title}</h3>
      {children}
    </section>
  );
}
