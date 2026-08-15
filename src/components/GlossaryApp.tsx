"use client";

import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { MethodologyDrawer } from "@/components/MethodologyDrawer";
import { useModel } from "@/components/ModelProvider";
import { GLOSSARY } from "@/model/glossary";

export function GlossaryApp() {
  const { params, commercial } = useModel();
  const [methodOpen, setMethodOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1180px] px-3.5 pb-[60px] pt-[18px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-terracotta">
            Belvie · Bengaluru
          </div>
          <h1 className="mt-1 font-serif text-[clamp(22px,3vw,32px)] font-normal text-charcoal">
            Line items
          </h1>
          <p className="mt-0.5 text-[13.5px] text-gray">
            Every input, factor and constraint — including line-haul — in one place. “Now” is this
            session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AppNav active="glossary" />
          <button
            type="button"
            onClick={() => setMethodOpen(true)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] text-gray hover:border-terracotta hover:text-terracotta"
          >
            Methodology
          </button>
        </div>
      </header>

      <nav
        aria-label="Sections"
        className="mb-5 flex flex-wrap gap-1.5 border-b border-line pb-3"
      >
        {GLOSSARY.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] text-gray no-underline hover:border-terracotta hover:text-terracotta"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {GLOSSARY.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-4">
            <h2 className="m-0 font-serif text-xl font-normal text-charcoal">{section.title}</h2>
            <p className="mb-3 mt-1 text-[13px] leading-[1.5] text-gray">{section.lead}</p>
            <div className="overflow-x-auto rounded-[10px] border border-line bg-white">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    {["Line item", "Symbol", "Now", "Unit", "What it is"].map((h, i) => (
                      <th
                        key={h}
                        className={`bg-charcoal px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-card ${
                          i === 0 || i === 4 ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item) => (
                    <tr key={item.name} className="align-top">
                      <td className="border-b border-line px-2.5 py-2 text-left font-semibold text-charcoal">
                        {item.name}
                        {item.formula ? (
                          <div className="mt-1 font-mono text-[11px] font-normal text-gray">
                            {item.formula}
                          </div>
                        ) : null}
                      </td>
                      <td className="border-b border-line px-2.5 py-2 text-right font-mono text-[12px] text-gray">
                        {item.symbol}
                      </td>
                      <td className="border-b border-line px-2.5 py-2 text-right font-serif tabular-nums text-charcoal">
                        {item.now ? item.now(params, commercial) : item.def}
                      </td>
                      <td className="border-b border-line px-2.5 py-2 text-right text-[11.5px] text-gray">
                        {item.unit}
                      </td>
                      <td className="border-b border-line px-2.5 py-2 text-left leading-[1.45] text-ink">
                        {item.meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-[18px] border-t border-line pt-2.5 text-[11.5px] leading-[1.55] text-gray">
        Defaults in the tables are the shipped base case. The Now column is whatever you have set
        on P&L and Network in this session. All figures are planning estimates, not observed
        operating data.
      </p>

      <MethodologyDrawer open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  );
}
