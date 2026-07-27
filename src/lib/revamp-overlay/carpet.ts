/** Area carpet / rug with pattern, border and fringe — clearly on the floor. */

function darken(hex: string, n: number): string {
  const v = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((v >> 16) & 0xff) - n);
  const g = Math.max(0, ((v >> 8) & 0xff) - n);
  const b = Math.max(0, (v & 0xff) - n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lighten(hex: string, n: number): string {
  const v = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((v >> 16) & 0xff) + n);
  const g = Math.min(255, ((v >> 8) & 0xff) + n);
  const b = Math.min(255, (v & 0xff) + n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function drawRugPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rw: number,
  rh: number,
  base: string,
  accent: string,
) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, rw, rh);

  // Border bands
  const bands = [0.06, 0.1, 0.14];
  for (const band of bands) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = rw * band * 0.15;
    ctx.strokeRect(
      x + rw * band,
      y + rh * band * 1.2,
      rw * (1 - band * 2),
      rh * (1 - band * 2.2),
    );
  }

  // Central medallion
  const cx = x + rw / 2;
  const cy = y + rh / 2;
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw * 0.22, rh * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = lighten(base, 30);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw * 0.12, rh * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Diamond weave
  ctx.strokeStyle = darken(accent, 20);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  const step = rw * 0.04;
  for (let row = 0; row < rh / step; row++) {
    for (let col = 0; col < rw / step; col++) {
      const px = x + col * step;
      const py = y + row * step;
      if ((row + col) % 2 === 0) {
        ctx.strokeRect(px, py, step, step);
      }
    }
  }
  ctx.globalAlpha = 1;
}

export function drawCarpet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseColor: string,
  accentColor: string,
) {
  // Perspective floor quad
  const topLeft = { x: w * 0.18, y: h * 0.76 };
  const topRight = { x: w * 0.82, y: h * 0.76 };
  const bottomRight = { x: w * 0.92, y: h * 0.96 };
  const bottomLeft = { x: w * 0.08, y: h * 0.96 };

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.closePath();
  ctx.clip();

  // Shadow under rug
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(w * 0.1, h * 0.74, w * 0.8, h * 0.24);

  const rugX = w * 0.2;
  const rugY = h * 0.77;
  const rugW = w * 0.6;
  const rugH = h * 0.17;

  drawRugPattern(ctx, rugX, rugY, rugW, rugH, baseColor, accentColor);

  // Rug pile highlight
  const pileGrad = ctx.createLinearGradient(rugX, rugY, rugX, rugY + rugH);
  pileGrad.addColorStop(0, "rgba(255,255,255,0.15)");
  pileGrad.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = pileGrad;
  ctx.fillRect(rugX, rugY, rugW, rugH);

  ctx.restore();

  // Fringe tassels along bottom edge
  ctx.save();
  ctx.strokeStyle = lighten(baseColor, 40);
  ctx.lineWidth = 2;
  const fringeY = h * 0.945;
  for (let i = 0; i < 28; i++) {
    const fx = w * 0.12 + (w * 0.76 * i) / 27;
    ctx.beginPath();
    ctx.moveTo(fx, fringeY);
    ctx.lineTo(fx + (i % 2 === 0 ? 2 : -2), fringeY + h * 0.018);
    ctx.stroke();
  }
  ctx.restore();

  // Small label
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `bold ${Math.max(9, w * 0.016)}px system-ui, sans-serif`;
  ctx.fillText("AREA CARPET", rugX + 8, rugY + rugH - 6);
  ctx.restore();
}
