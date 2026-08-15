/**
 * Headless visual QA for plan markup overlay.
 * Run: npx --yes playwright install chromium && node scripts/qa-markup.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/qa");
mkdirSync(outDir, { recursive: true });

const BEFORE =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85";

const html = `<!DOCTYPE html>
<html><body style="margin:0;background:#111">
<canvas id="c"></canvas>
<script type="module">
const NAMED = { terracotta:"#c4623f", sage:"#7d8b6f", walnut:"#5c4033" };
function shortLabel(change) {
  const t = change.toLowerCase();
  if (t.includes("wallpaper")) return "Wallpaper";
  if (t.includes("panel")) return "Wall panels";
  if (t.includes("carpet") || t.includes("rug")) return "Area carpet";
  if (t.includes("cushion")) return "Soft furnishings";
  if (t.includes("lamp")) return "Plug-in lighting";
  if (t.includes("art")) return "Wall art";
  return change.split(" ").slice(0,3).join(" ");
}
function markersFor(changes) {
  const slots = {
    Wallpaper: {x:0.62,y:0.28}, "Wall panels":{x:0.78,y:0.36},
    "Area carpet":{x:0.5,y:0.82}, "Soft furnishings":{x:0.42,y:0.62},
    "Plug-in lighting":{x:0.14,y:0.58}, "Wall art":{x:0.55,y:0.18}
  };
  return changes.slice(0,6).map((c,i) => {
    const label = shortLabel(c);
    const s = slots[label] || {x:0.2+i*0.15,y:0.3};
    return { ...s, label };
  });
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
const img = new Image();
img.crossOrigin = "anonymous";
img.onload = () => {
  const canvas = document.getElementById("c");
  const w = img.naturalWidth, h = img.naturalHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img,0,0,w,h);
  const changes = ["Wallpaper accent","Wooden wall panels","Area rug","Sofa cushions","Floor lamp","Wall art"];
  const markers = markersFor(changes);
  const scale = Math.max(w,h)/1000;
  const badgeR = Math.max(14,16*scale);
  const fontPx = Math.max(12, Math.round(14*scale));
  const pad = Math.max(8,10*scale);
  const bannerH = Math.max(36, Math.round(h*0.055));
  ctx.fillStyle="rgba(20,18,16,0.72)"; ctx.fillRect(0,0,w,bannerH);
  ctx.fillStyle="#fff"; ctx.font=\`600 \${Math.max(11,Math.round(13*scale))}px system-ui\`;
  ctx.fillText("Belvie cosmetic plan · Living / Hall", pad*1.2, bannerH*0.68);
  markers.forEach((m,i)=>{
    const cx=m.x*w, cy=m.y*h, n=i+1;
    ctx.beginPath(); ctx.arc(cx+1,cy+2,badgeR,0,Math.PI*2); ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,badgeR,0,Math.PI*2); ctx.fillStyle="#c4623f"; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle="#fff"; ctx.stroke();
    ctx.fillStyle="#fff"; ctx.font=\`700 \${Math.max(12,Math.round(15*scale))}px system-ui\`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(String(n),cx,cy+0.5);
    const text = n+". "+m.label;
    ctx.textAlign="left"; ctx.font=\`600 \${fontPx}px system-ui\`;
    const tw=ctx.measureText(text).width, boxW=tw+pad*2, boxH=fontPx+pad*1.4;
    let bx=cx+badgeR+10*scale, by=cy-boxH/2;
    if(bx+boxW>w-8) bx=cx-badgeR-10*scale-boxW;
    if(by<bannerH+4) by=bannerH+4;
    ctx.fillStyle="rgba(255,255,255,0.94)"; roundRect(ctx,bx,by,boxW,boxH,4); ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.12)"; ctx.stroke();
    ctx.fillStyle="#1a1a1a"; ctx.fillText(text,bx+pad,by+boxH/2);
  });
  const stripH=Math.max(28,Math.round(h*0.045));
  ctx.fillStyle="rgba(20,18,16,0.7)"; ctx.fillRect(0,h-stripH,w,stripH);
  ctx.fillStyle="#fff"; ctx.font=\`500 \${Math.max(10,Math.round(11*scale))}px system-ui\`;
  ctx.textAlign="left"; ctx.textBaseline="middle";
  ctx.fillText("Palette: Terracotta · Walnut · Sand  ·  Structure unchanged", pad*1.2, h-stripH/2);
  window.__DONE = canvas.toDataURL("image/jpeg",0.92);
};
img.onerror = () => { window.__DONE = "ERROR"; };
img.src = ${JSON.stringify(BEFORE)};
</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__DONE, null, { timeout: 60000 });
const dataUrl = await page.evaluate(() => window.__DONE);
await browser.close();

if (!dataUrl || dataUrl === "ERROR" || !dataUrl.startsWith("data:image")) {
  console.error("QA FAILED: could not render markup");
  process.exit(1);
}

const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
const outPath = join(outDir, "markup-after.jpg");
writeFileSync(outPath, Buffer.from(base64, "base64"));
console.log("QA OK wrote", outPath, "bytes", Buffer.from(base64, "base64").length);
