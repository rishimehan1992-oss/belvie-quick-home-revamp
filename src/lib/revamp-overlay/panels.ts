/** Wooden wall panels — vertical slats with depth and grain. */

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

export function drawWallPanels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  woodColor: string,
) {
  const panelX = w * 0.55;
  const panelY = h * 0.1;
  const panelW = w * 0.32;
  const panelH = h * 0.48;
  const slatCount = 7;
  const slatW = panelW / slatCount;

  // Panel frame shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = w * 0.012;
  ctx.shadowOffsetX = w * 0.004;
  ctx.fillStyle = darken(woodColor, 60);
  ctx.fillRect(panelX - 4, panelY - 4, panelW + 8, panelH + 8);
  ctx.restore();

  for (let i = 0; i < slatCount; i++) {
    const x = panelX + i * slatW;
    const grad = ctx.createLinearGradient(x, panelY, x + slatW, panelY);
    grad.addColorStop(0, darken(woodColor, 25));
    grad.addColorStop(0.35, lighten(woodColor, 35));
    grad.addColorStop(0.65, woodColor);
    grad.addColorStop(1, darken(woodColor, 35));

    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, panelY, slatW - 2, panelH);

    // Wood grain lines
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = darken(woodColor, 50);
    ctx.lineWidth = 1;
    for (let g = 0; g < 12; g++) {
      const gy = panelY + (panelH / 12) * g + (i % 2) * 3;
      ctx.beginPath();
      ctx.moveTo(x + 3, gy);
      ctx.lineTo(x + slatW - 4, gy + 2);
      ctx.stroke();
    }
    ctx.restore();

    // Groove between slats
    if (i > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(x - 1, panelY, 2, panelH);
    }
  }

  // Top and bottom rail
  ctx.fillStyle = darken(woodColor, 40);
  ctx.fillRect(panelX, panelY - 6, panelW, 6);
  ctx.fillRect(panelX, panelY + panelH, panelW, 6);

  // Panel caption strip
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `bold ${Math.max(10, w * 0.018)}px system-ui, sans-serif`;
  ctx.fillText("WALL PANELS", panelX + 6, panelY + panelH + 18);
  ctx.restore();
}
