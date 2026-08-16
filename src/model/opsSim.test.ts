import { describe, expect, it } from "vitest";
import { buildOpsScene, buildOpsScenes, poseAt } from "./opsSim";
import { DEFAULTS } from "./defaults";

describe("opsSim", () => {
  it("advisor loop matches the solver kit cycle", () => {
    const scene = buildOpsScene(DEFAULTS, "large", DEFAULTS.D, 6);
    const adv = scene.agents.find((a) => a.kind === "advisor");
    expect(adv).toBeTruthy();
    if (!adv) return;
    expect(adv.period).toBeCloseTo(scene.cycle, 5);
    expect(scene.S).toBe(scene.best.S);
    expect(scene.nodes.filter((n) => n.kind === "spoke")).toHaveLength(scene.S);
  });

  it("small scale uses fewer spokes and longer hops than today's book", () => {
    const { small, large } = buildOpsScenes(DEFAULTS);
    expect(small.D).toBeLessThan(large.D);
    expect(small.S).toBeLessThanOrEqual(large.S);
    expect(small.dBar).toBeGreaterThan(large.dBar);
    expect(small.rt).toBeGreaterThan(large.rt);
  });

  it("poses stay on a segment and advisors return to the spoke", () => {
    const scene = buildOpsScene(DEFAULTS, "small", 3000, 5);
    const adv = scene.agents.find((a) => a.kind === "advisor");
    expect(adv).toBeTruthy();
    if (!adv) return;
    const mid = poseAt(adv, adv.period * 0.4);
    expect(Number.isFinite(mid.x)).toBe(true);
    const kit = poseAt(adv, 0.1);
    expect(kit.phase).toBe("kit");
    const end = poseAt(adv, adv.period - 0.01);
    expect(end.phase).toBe("toSpoke");
  });
});
