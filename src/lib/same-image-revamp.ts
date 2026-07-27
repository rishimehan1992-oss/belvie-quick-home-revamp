/**
 * Apply Belvie renovation layers on the exact same room photo.
 * Always adds: wallpaper, wall panels, area carpet, and furniture/decor.
 */

import { drawWallpaper } from "./revamp-overlay/wallpaper";
import { drawWallPanels } from "./revamp-overlay/panels";
import { drawCarpet } from "./revamp-overlay/carpet";
import { drawFurniture } from "./revamp-overlay/furniture";

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
  brown: "#6b4423",
  wood: "#8b6914",
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

function drawLegend(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const items = ["WALLPAPER", "PANELS", "CARPET", "FURNITURE"];
  const boxH = Math.max(18, h * 0.028);
  const fontSize = Math.max(8, w * 0.014);
  const pad = 6;
  const gap = 4;

  ctx.save();
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;

  let totalW = pad;
  for (const item of items) {
    totalW += ctx.measureText(item).width + pad * 2 + gap;
  }

  let x = w - totalW - 8;
  const y = 8;

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x - 4, y - 2, totalW + 8, boxH + 8);

  for (const item of items) {
    const tw = ctx.measureText(item).width;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(x, y + 2, tw + pad * 2, boxH);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(item, x + pad, y + boxH - 4);
    x += tw + pad * 2 + gap;
  }
  ctx.restore();
}

/**
 * Draws the original photo, then layers renovation items on top.
 * Room structure (doors, walls, cabinets) stays — we add visible products.
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

  // 1. Exact same photograph as base
  ctx.drawImage(img, 0, 0, w, h);

  const palette = config.colorPalette.length
    ? config.colorPalette
    : ["Terracotta", "Sage green", "Walnut"];
  const wallColor = parseColor(palette[0], "#c4623f");
  const accentColor = parseColor(palette[1] ?? palette[0], "#7d8b6f");
  const rugColor = parseColor(palette[2] ?? palette[1] ?? palette[0], "#5c4033");
  const woodColor = parseColor(
    palette.find((c) => /walnut|wood|brown|oak/i.test(c)) ?? palette[1] ?? "",
    "#6b4423",
  );

  const roomType = config.roomType ?? "living";

  // 2. Wallpaper on wall zones
  drawWallpaper(ctx, w, h, wallColor, accentColor);

  // 3. Wooden wall panels
  drawWallPanels(ctx, w, h, woodColor);

  // 4. Area carpet on floor
  drawCarpet(ctx, w, h, rugColor, accentColor);

  // 5. Add-on furniture & decor
  drawFurniture(ctx, w, h, wallColor, accentColor, woodColor, roomType);

  // Legend so user sees what was added
  drawLegend(ctx, w, h);

  return canvas.toDataURL("image/jpeg", 0.93);
}
