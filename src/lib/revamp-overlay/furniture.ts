/** Add-on furniture & decor placed on the room — lamps, cushions, side table, frames. */

function darken(hex: string, n: number): string {
  const v = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((v >> 16) & 0xff) - n);
  const g = Math.max(0, ((v >> 8) & 0xff) - n);
  const b = Math.max(0, (v & 0xff) - n);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function drawFloorLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  shadeColor: string,
) {
  const poleH = 120 * scale;
  const baseW = 28 * scale;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 4 * scale;

  // Base
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.ellipse(x, y, baseW, baseW * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pole
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(x - 3 * scale, y - poleH, 6 * scale, poleH);

  // Shade
  ctx.fillStyle = shadeColor;
  ctx.beginPath();
  ctx.moveTo(x - 22 * scale, y - poleH);
  ctx.lineTo(x + 22 * scale, y - poleH);
  ctx.lineTo(x + 16 * scale, y - poleH - 38 * scale);
  ctx.lineTo(x - 16 * scale, y - poleH - 38 * scale);
  ctx.closePath();
  ctx.fill();

  // Warm glow
  const glow = ctx.createRadialGradient(
    x,
    y - poleH - 20 * scale,
    0,
    x,
    y - poleH - 20 * scale,
    50 * scale,
  );
  glow.addColorStop(0, "rgba(255,220,150,0.55)");
  glow.addColorStop(1, "rgba(255,220,150,0)");
  ctx.fillStyle = glow;
  ctx.globalCompositeOperation = "screen";
  ctx.fillRect(x - 60 * scale, y - poleH - 80 * scale, 120 * scale, 100 * scale);

  ctx.restore();
}

function drawCushion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotation);
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, darken(color, 30));
  ctx.fillStyle = grad;

  const r = w * 0.18;
  const left = -w / 2;
  const top = -h / 2;
  ctx.beginPath();
  ctx.moveTo(left + r, top);
  ctx.lineTo(left + w - r, top);
  ctx.quadraticCurveTo(left + w, top, left + w, top + r);
  ctx.lineTo(left + w, top + h - r);
  ctx.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
  ctx.lineTo(left + r, top + h);
  ctx.quadraticCurveTo(left, top + h, left, top + h - r);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();
  ctx.fill();

  // Tuft button
  ctx.fillStyle = darken(color, 50);
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSideTable(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  woodColor: string,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 10 * scale;
  ctx.shadowOffsetY = 5 * scale;

  const topW = 55 * scale;
  const topH = 8 * scale;
  const legH = 45 * scale;

  // Top
  const topGrad = ctx.createLinearGradient(x, y - legH, x, y - legH + topH);
  topGrad.addColorStop(0, woodColor);
  topGrad.addColorStop(1, darken(woodColor, 25));
  ctx.fillStyle = topGrad;
  ctx.fillRect(x - topW / 2, y - legH, topW, topH);

  // Legs
  ctx.fillStyle = darken(woodColor, 35);
  const legW = 5 * scale;
  ctx.fillRect(x - topW / 2 + 6 * scale, y - legH + topH, legW, legH);
  ctx.fillRect(x + topW / 2 - 11 * scale, y - legH + topH, legW, legH);

  ctx.restore();
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  // Pot
  ctx.fillStyle = "#c4623f";
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.lineTo(x + 12 * scale, y);
  ctx.lineTo(x + 9 * scale, y + 22 * scale);
  ctx.lineTo(x - 9 * scale, y + 22 * scale);
  ctx.closePath();
  ctx.fill();

  // Leaves
  ctx.fillStyle = "#3d6b4f";
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i - 2) * 0.45;
    const lx = x + Math.cos(angle) * 18 * scale;
    const ly = y - 8 * scale + Math.sin(angle) * 22 * scale;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 10 * scale, 18 * scale, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWallArt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Frame
  ctx.fillStyle = "#3d2b1f";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(x + w * 0.06, y + h * 0.08, w * 0.88, h * 0.84);

  // Art block
  ctx.fillStyle = accent;
  ctx.fillRect(x + w * 0.12, y + h * 0.14, w * 0.76, h * 0.72);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x + w * 0.2, y + h * 0.22, w * 0.3, h * 0.4);

  ctx.restore();
}

function drawThrowBlanket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalAlpha = 0.88;
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, color);
  grad.addColorStop(1, darken(color, 20));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h * 0.1);
  ctx.lineTo(x + w * 0.95, y + h);
  ctx.lineTo(x + w * 0.05, y + h * 0.9);
  ctx.closePath();
  ctx.fill();

  // Fold lines
  ctx.strokeStyle = darken(color, 40);
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (w / 4) * i, y);
    ctx.lineTo(x + (w / 4) * i - 5, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFurniture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primary: string,
  accent: string,
  wood: string,
  roomType: string,
) {
  const scale = w / 800;
  const room = roomType.toLowerCase();
  const isBedroom = room.includes("bed");

  // Floor lamp — left
  drawFloorLamp(ctx, w * 0.12, h * 0.88, scale, accent);

  // Side table + plant — right
  drawSideTable(ctx, w * 0.88, h * 0.86, scale, wood);
  drawPlant(ctx, w * 0.88, h * 0.86 - 50 * scale, scale);

  // Cushions on sofa / seating zone
  drawCushion(ctx, w * 0.38, h * 0.68, w * 0.1, h * 0.08, primary, -0.15);
  drawCushion(ctx, w * 0.5, h * 0.7, w * 0.09, h * 0.075, accent, 0.1);
  drawCushion(ctx, w * 0.6, h * 0.69, w * 0.085, h * 0.07, darken(primary, 15), 0.2);

  // Wall art frames on back wall
  drawWallArt(ctx, w * 0.42, h * 0.14, w * 0.1, h * 0.14, accent);
  drawWallArt(ctx, w * 0.54, h * 0.12, w * 0.08, h * 0.11, primary);

  if (isBedroom) {
    drawThrowBlanket(ctx, w * 0.3, h * 0.55, w * 0.42, h * 0.12, accent);
  }

  // Furniture callout
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `bold ${Math.max(9, w * 0.016)}px system-ui, sans-serif`;
  ctx.fillText("+ FURNITURE & DECOR", w * 0.04, h * 0.97);
  ctx.restore();
}
