/**
 * Professional design-markup overlay on the EXACT room photo.
 * No colour washes, no wallpaper fills, no reinvented rooms.
 * Shows numbered callouts for planned cosmetic changes.
 */

export type MarkupConfig = {
  colorPalette: string[];
  keyChanges: string[];
  roomType?: string;
  primaryTheme?: string;
};

type Marker = {
  x: number; // 0–1
  y: number;
  label: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load room photo"));
    img.src = src;
  });
}

function shortLabel(change: string): string {
  const t = change.toLowerCase();
  if (t.includes("wallpaper") || t.includes("paint")) return "Wallpaper";
  if (t.includes("panel")) return "Wall panels";
  if (t.includes("carpet") || t.includes("rug")) return "Area carpet";
  if (t.includes("curtain") || t.includes("drape") || t.includes("blind"))
    return "Curtains";
  if (t.includes("cushion") || t.includes("throw") || t.includes("bedding") || t.includes("linen"))
    return "Soft furnishings";
  if (t.includes("lamp") || t.includes("light")) return "Plug-in lighting";
  if (t.includes("art") || t.includes("mirror") || t.includes("frame"))
    return "Wall art";
  if (t.includes("plant")) return "Plants";
  if (t.includes("sofa") || t.includes("chair") || t.includes("table") || t.includes("furniture") || t.includes("desk"))
    return "Furniture add-on";
  const words = change.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).slice(0, 3);
  return words.join(" ") || "Styling";
}

/** Heuristic marker positions by change type — room photo stays untouched underneath */
function markersFor(changes: string[], roomType?: string): Marker[] {
  const room = (roomType ?? "").toLowerCase();
  const isBed = room.includes("bed");
  const isStudy = room.includes("study") || room.includes("office");

  const slots: Record<string, { x: number; y: number }> = {
    Wallpaper: { x: 0.62, y: 0.28 },
    "Wall panels": { x: 0.78, y: 0.36 },
    "Area carpet": { x: 0.5, y: 0.82 },
    Curtains: { x: 0.9, y: 0.32 },
    "Soft furnishings": isBed ? { x: 0.48, y: 0.55 } : { x: 0.42, y: 0.62 },
    "Plug-in lighting": { x: 0.14, y: 0.58 },
    "Wall art": { x: 0.55, y: 0.18 },
    Plants: { x: 0.22, y: 0.7 },
    "Furniture add-on": isStudy ? { x: 0.5, y: 0.65 } : { x: 0.68, y: 0.68 },
  };

  const used = new Set<string>();
  const markers: Marker[] = [];

  for (const change of changes.slice(0, 6)) {
    const label = shortLabel(change);
    const key = used.has(label) ? `${label} ${markers.length + 1}` : label;
    used.add(label);
    const slot = slots[label] ?? {
      x: 0.2 + (markers.length % 3) * 0.28,
      y: 0.25 + Math.floor(markers.length / 3) * 0.28,
    };
    // slight jitter so duplicates don't stack
    const jitter = used.has(label) && markers.some((m) => m.label === label) ? 0.06 : 0;
    markers.push({
      x: Math.min(0.92, slot.x + jitter),
      y: Math.min(0.9, slot.y + jitter * 0.5),
      label: key,
    });
  }

  if (!markers.length) {
    return [
      { x: 0.6, y: 0.3, label: "Wallpaper" },
      { x: 0.5, y: 0.8, label: "Area carpet" },
      { x: 0.15, y: 0.55, label: "Lighting" },
      { x: 0.4, y: 0.6, label: "Cushions" },
    ];
  }

  return markers;
}

function drawRoundedRect(
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
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Draws the original photograph unchanged, then adds clean numbered
 * consultant-style callouts for the planned cosmetic changes.
 */
export async function applyStylingToImage(
  imageSrc: string,
  config: MarkupConfig,
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Exact same photograph — untouched
  ctx.drawImage(img, 0, 0, w, h);

  const markers = markersFor(config.keyChanges, config.roomType);
  const scale = Math.max(w, h) / 1000;
  const badgeR = Math.max(14, 16 * scale);
  const fontPx = Math.max(12, Math.round(14 * scale));
  const pad = Math.max(8, 10 * scale);

  // Soft top banner — plan title only (no colour wash on the room)
  const bannerH = Math.max(36, Math.round(h * 0.055));
  ctx.fillStyle = "rgba(20, 18, 16, 0.72)";
  ctx.fillRect(0, 0, w, bannerH);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.max(11, Math.round(13 * scale))}px "Segoe UI", system-ui, sans-serif`;
  const theme = config.primaryTheme ? ` · ${config.primaryTheme}` : "";
  ctx.fillText(`Belvie cosmetic plan${theme}`, pad * 1.2, bannerH * 0.68);

  markers.forEach((marker, i) => {
    const cx = marker.x * w;
    const cy = marker.y * h;
    const n = i + 1;

    // Leader line from badge toward label
    const labelX = cx + badgeR + 10 * scale;
    const labelY = cy;

    // Shadow under badge
    ctx.beginPath();
    ctx.arc(cx + 1 * scale, cy + 2 * scale, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    // Number badge
    ctx.beginPath();
    ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = "#c4623f"; // saffron/terracotta
    ctx.fill();
    ctx.lineWidth = Math.max(2, 2 * scale);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.max(12, Math.round(15 * scale))}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), cx, cy + 0.5);

    // Label pill
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${fontPx}px "Segoe UI", system-ui, sans-serif`;
    const text = `${n}. ${marker.label}`;
    const tw = ctx.measureText(text).width;
    const boxW = tw + pad * 2;
    const boxH = fontPx + pad * 1.4;
    let bx = labelX;
    let by = labelY - boxH / 2;

    // Keep label on canvas
    if (bx + boxW > w - 8) bx = cx - badgeR - 10 * scale - boxW;
    if (by < bannerH + 4) by = bannerH + 4;
    if (by + boxH > h - 8) by = h - boxH - 8;

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    drawRoundedRect(ctx, bx, by, boxW, boxH, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(text, bx + pad, by + boxH / 2);
  });

  // Bottom strip — palette chips (small, not a wash)
  const stripH = Math.max(28, Math.round(h * 0.045));
  ctx.fillStyle = "rgba(20, 18, 16, 0.7)";
  ctx.fillRect(0, h - stripH, w, stripH);
  ctx.fillStyle = "#ffffff";
  ctx.font = `500 ${Math.max(10, Math.round(11 * scale))}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const palette = (config.colorPalette ?? []).slice(0, 4).join(" · ") || "Cosmetic styling only";
  ctx.fillText(`Palette: ${palette}  ·  Structure unchanged`, pad * 1.2, h - stripH / 2);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/** @deprecated alias — kept for imports that still say applyStylingToImage */
export type StylingOverlayConfig = MarkupConfig;
