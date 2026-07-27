/** Bold tiled wallpaper on wall zones — clearly visible, not a colour wash. */

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function createDamaskPattern(
  ctx: CanvasRenderingContext2D,
  base: string,
  accent: string,
): CanvasPattern {
  const tile = document.createElement("canvas");
  const size = 80;
  tile.width = size;
  tile.height = size;
  const t = tile.getContext("2d")!;

  t.fillStyle = base;
  t.fillRect(0, 0, size, size);

  t.fillStyle = accent;
  t.globalAlpha = 0.55;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const cx = col * 40 + 20;
      const cy = row * 40 + 20;
      t.beginPath();
      t.arc(cx, cy, 14, 0, Math.PI * 2);
      t.fill();
      t.beginPath();
      t.moveTo(cx, cy - 18);
      t.lineTo(cx + 10, cy);
      t.lineTo(cx, cy + 18);
      t.lineTo(cx - 10, cy);
      t.closePath();
      t.fill();
    }
  }

  t.globalAlpha = 0.35;
  t.strokeStyle = darken(accent, 30);
  t.lineWidth = 1;
  for (let i = 0; i < size; i += 10) {
    t.beginPath();
    t.moveTo(i, 0);
    t.lineTo(i, size);
    t.stroke();
    t.beginPath();
    t.moveTo(0, i);
    t.lineTo(size, i);
    t.stroke();
  }

  return ctx.createPattern(tile, "repeat")!;
}

function clipLeftWall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.42, 0);
  ctx.lineTo(w * 0.38, h * 0.92);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.clip();
}

function clipBackWall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.beginPath();
  ctx.moveTo(w * 0.36, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.62);
  ctx.lineTo(w * 0.32, h * 0.58);
  ctx.closePath();
  ctx.clip();
}

export function drawWallpaper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseColor: string,
  accentColor: string,
) {
  const base = baseColor;
  const accent = lighten(accentColor, 20);
  const pattern = createDamaskPattern(ctx, base, accent);

  // Left wall
  ctx.save();
  clipLeftWall(ctx, w, h);
  ctx.fillStyle = pattern;
  ctx.globalAlpha = 0.88;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = darken(base, 40);
  ctx.fillRect(0, 0, w * 0.08, h);
  ctx.restore();

  // Back / accent wall
  ctx.save();
  clipBackWall(ctx, w, h);
  ctx.fillStyle = pattern;
  ctx.globalAlpha = 0.82;
  ctx.fillRect(0, 0, w, h);

  // Wallpaper seam line
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = darken(base, 50);
  ctx.lineWidth = 2;
  for (let x = w * 0.36; x < w; x += w * 0.08) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - w * 0.02, h * 0.6);
    ctx.stroke();
  }
  ctx.restore();

  // Label-style wallpaper roll edge at bottom of back wall
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = darken(base, 20);
  ctx.fillRect(w * 0.36, h * 0.54, w * 0.64, h * 0.025);
  ctx.restore();
}
