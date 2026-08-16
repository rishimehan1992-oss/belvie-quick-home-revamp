"use client";

import { poseAt, type OpsScene } from "@/model/opsSim";

const HUB = "#2B2622";
const SPOKE = "#BA5D42";
const HOME = "#C9BEB6";
const VAN = "#4A7A5C";
const HAUL = "#8C9A8E";
const LINE = "#E4D8D0";

function toSvg(x: number, y: number, cityR: number, size: number) {
  const pad = 26;
  const scale = (size / 2 - pad) / Math.max(cityR, 1);
  return { x: size / 2 + x * scale, y: size / 2 + y * scale };
}

export function OpsSimCanvas({
  scene,
  tMin,
  size = 420,
}: {
  scene: OpsScene;
  tMin: number;
  size?: number;
}) {
  const poses = scene.agents.map((a) => poseAt(a, tMin));
  const focus =
    poses.find((p) => p.kind === "advisor" && (p.phase === "consult" || p.phase === "toHome")) ??
    poses.find((p) => p.kind === "advisor") ??
    poses[0];

  return (
    <div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={`${scene.title} hub and spoke map`}
        className="block rounded-[10px] bg-cream"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 26}
          fill="#F6EDE8"
          stroke={LINE}
          strokeWidth="1.5"
        />
        {scene.nodes
          .filter((n) => n.kind === "spoke")
          .map((n) => {
            const a = toSvg(n.x, n.y, scene.cityR, size);
            const h = toSvg(0, 0, scene.cityR, size);
            return (
              <line
                key={`link-${n.id}`}
                x1={h.x}
                y1={h.y}
                x2={a.x}
                y2={a.y}
                stroke={LINE}
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}
        {scene.nodes
          .filter((n) => n.kind === "home")
          .map((n) => {
            const p = toSvg(n.x, n.y, scene.cityR, size);
            return <circle key={n.id} cx={p.x} cy={p.y} r="2.4" fill={HOME} />;
          })}
        {scene.nodes
          .filter((n) => n.kind === "spoke")
          .map((n, i) => {
            const p = toSvg(n.x, n.y, scene.cityR, size);
            return (
              <g key={n.id}>
                <rect x={p.x - 5} y={p.y - 5} width="10" height="10" rx="2" fill={SPOKE} />
                <text x={p.x} y={p.y - 8} textAnchor="middle" fill={SPOKE} fontSize="8">
                  S{i + 1}
                </text>
              </g>
            );
          })}
        {(() => {
          const h = toSvg(0, 0, scene.cityR, size);
          return (
            <g>
              <circle cx={h.x} cy={h.y} r="8" fill={HUB} />
              <text x={h.x} y={h.y + 3} textAnchor="middle" fill="#FBF7F4" fontSize="7" fontWeight="700">
                H
              </text>
            </g>
          );
        })()}
        {poses.map((p) => {
          const q = toSvg(p.x, p.y, scene.cityR, size);
          const deg = (p.heading * 180) / Math.PI;
          if (p.kind === "advisor") {
            return (
              <g key={p.id} transform={`translate(${q.x} ${q.y}) rotate(${deg})`}>
                {p.phase === "consult" ? (
                  <circle r="7" fill="none" stroke={SPOKE} strokeWidth="1.2" opacity="0.7" />
                ) : null}
                <circle r="3.4" fill={SPOKE} />
                <polygon points="7,0 -2.5,-3 -2.5,3" fill={SPOKE} />
              </g>
            );
          }
          const fill = p.kind === "vanLineHaul" ? HAUL : VAN;
          return (
            <g key={p.id} transform={`translate(${q.x} ${q.y}) rotate(${deg})`}>
              <rect x="-7" y="-3.4" width="14" height="6.8" rx="1.6" fill={fill} />
              <rect x="3" y="-2.2" width="3.2" height="4.4" rx="0.6" fill="#FBF7F4" opacity="0.35" />
            </g>
          );
        })}
      </svg>
      <p className="mb-0 mt-2 text-[11.5px] leading-[1.4] text-gray">
        <b className="text-charcoal">{focus?.label ?? "—"}</b>
        {focus?.kind === "advisor" ? " · scooter" : focus?.kind === "vanLineHaul" ? " · line-haul" : " · last-mile van"}
      </p>
    </div>
  );
}
