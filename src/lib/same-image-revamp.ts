/** Apply Belvie styling layers on the exact same room photo (canvas overlays). */

export type StylingOverlayConfig = {
  colorPalette: string[];
  keyChanges?: string[];
  roomType?: string;
};

const NAMED_COLORS: Record<string, string> = {
  terracotta: "#c4623f",
  saffron: "#e8a838",
  sage: "#7d8b6f",
  cream: "#f5f0e8",
  ivory: "#fffff0",
  beige: "#d4c4a8",
  walnut: "#5c4033",
  charcoal: "#36454f",
  navy: "#1e3a5f",
  teal: "#2d6a6a",
  mustard: "#d4a017",
  rust: "#b7410e",
  linen: "#e8dcc8",
  sand: "#c2b280",
  olive: "#6b6b47",
  blush: "#e8c4c4",
  white: "#f8f8f8",
  warm: "#e8d5c4",
  gold: "#c9a227",
};

function parseColor(input: string, fallback: string): string {
  const hex = input.match(/#[0-9a-fA-F]{6}/)?.[0];
  if (hex) return hex;

  const lower = input.toLowerCase();
  for (const [name, value] of Object.entries(NAMED_COLORS)) {
    if (lower.includes(name)) return value;
  }

  return fallback;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load room photo"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function changesText(config: StylingOverlayConfig): string {
  return (config.keyChanges ?? []).join(" ").toLowerCase();
}

function wantsFeature(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function drawWallpaperZones(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  intensity: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = intensity;
  ctx.fillStyle = color;
  // Left wall
  ctx.fillRect(0, 0, w * 0.36, h * 0.9);
  // Back wall
  ctx.fillRect(w * 0.34, 0, w * 0.66, h * 0.58);
  ctx.restore();

  // Subtle vertical wallpaper grain
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = "#1a1a1a";
  for (let x = 0; x < w; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h * 0.58);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWallPanels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  const panelX = w * 0.58;
  const panelW = w * 0.28;
  ctx.fillRect(panelX, h * 0.12, panelW, h * 0.42);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const x = panelX + (panelW / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.12);
    ctx.lineTo(x, h * 0.54);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRug(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.34;
  const rugW = w * 0.52;
  const rugH = h * 0.17;
  const rugX = (w - rugW) / 2;
  const rugY = h * 0.79;
  roundRect(ctx, rugX, rugY, rugW, rugH, 10);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Rug border
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, rugX + 6, rugY + 6, rugW - 12, rugH - 12, 6);
  ctx.stroke();
  ctx.restore();
}

function drawCurtains(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w * 0.1, h * 0.72);
  ctx.fillRect(w * 0.9, 0, w * 0.1, h * 0.72);
  ctx.restore();
}

function drawBeddingWarmth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = color;
  ctx.fillRect(w * 0.2, h * 0.48, w * 0.6, h * 0.38);
  ctx.restore();
}

function drawWarmGrade(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Draws the original photo, then layers styling edits on top.
 * Structure (doors, walls, cabinets) is never altered — only surface overlays.
 */
export async function applyStylingToImage(
  imageSrc: string,
  config: StylingOverlayConfig,
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Exact same photograph as the base layer
  ctx.drawImage(img, 0, 0, w, h);

  const palette = config.colorPalette.length
    ? config.colorPalette
    : ["Warm terracotta", "Sage green", "Cream"];
  const wallColor = parseColor(palette[0], "#c4a484");
  const accentColor = parseColor(palette[1] ?? palette[0], "#8b7355");
  const rugColor = parseColor(palette[2] ?? palette[1] ?? palette[0], "#6b5344");

  const text = changesText(config);
  const room = (config.roomType ?? "").toLowerCase();

  const showWallpaper =
    wantsFeature(text, ["wallpaper", "wall paper", "accent wall", "panel"]) ||
    room.includes("living") ||
    room.includes("hall");
  const showRug =
    wantsFeature(text, ["rug", "carpet", "area rug"]) ||
    room.includes("living");
  const showCurtains = wantsFeature(text, ["curtain", "drape", "blackout"]);
  const showPanels = wantsFeature(text, ["panel", "wooden wall"]);
  const showBedding =
    wantsFeature(text, ["bedding", "linen", "throw", "blanket"]) ||
    room.includes("bed");

  if (showWallpaper) drawWallpaperZones(ctx, w, h, wallColor, 0.24);
  if (showPanels) drawWallPanels(ctx, w, h, accentColor);
  if (showRug) drawRug(ctx, w, h, rugColor);
  if (showCurtains) drawCurtains(ctx, w, h, accentColor);
  if (showBedding) drawBeddingWarmth(ctx, w, h, wallColor);

  // Always apply a gentle cohesive colour grade from the palette
  drawWarmGrade(ctx, w, h, wallColor);

  return canvas.toDataURL("image/jpeg", 0.92);
}
