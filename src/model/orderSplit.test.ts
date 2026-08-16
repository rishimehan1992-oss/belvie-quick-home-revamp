import { describe, expect, it } from "vitest";
import { DEFAULTS } from "./defaults";
import { orderSplit } from "./orderSplit";
import { COMMERCIAL_DEFAULTS, consultsFromNetwork } from "./pnl";
import { normalise, optimise } from "./solver";

describe("orderSplit", () => {
  it("serve ₹/order pieces sum to the headline cost / order", () => {
    const { best } = optimise(normalise(DEFAULTS));
    expect(best).toBeTruthy();
    if (!best) return;
    const consults = consultsFromNetwork(DEFAULTS);
    const split = orderSplit(
      best,
      DEFAULTS,
      consults,
      COMMERCIAL_DEFAULTS.samplingCost,
      COMMERCIAL_DEFAULTS.visitCost,
    );
    const serve = split.lines.filter((l) => l.inServe).reduce((s, l) => s + l.perOrder, 0);
    expect(serve).toBeCloseTo(split.servePerOrder, 6);
    expect(split.servePerOrder).toBeCloseTo(best.cpo + split.samplingPerOrder, 6);
    const hubSpoke =
      (split.lines.find((l) => l.id === "hub")?.month ?? 0) +
      (split.lines.find((l) => l.id === "spoke")?.month ?? 0);
    expect(hubSpoke).toBeCloseTo(best.Cinf, 4);
  });
});
