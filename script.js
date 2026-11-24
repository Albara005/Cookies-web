/* =========================================================
   كوكيز البيت — صفحة هبوط بكوكيز ثلاثية الأبعاد تتنقّل بين الأقسام
   - رسومات الكوكيز والمكوّنات تُرسم بالكود (SVG) ولا تحتاج صورًا
   - كل كوكيز ثلاثية الأبعاد تُرسم في لوحة #gl واحدة (Three.js)
   - الكوكيز المختارة في الواجهة تطير إلى قسم «من الداخل» ثم إلى بطاقتها في المتجر
   ========================================================= */

/* ---------- إعدادات المتجر: عدّلها لمشروعك ---------- */
const SHOP = {
  name: "كوكيز البيت",
  orderEmail: "orders@homecrumbs.example", // <- ضع بريدك الإلكتروني هنا
  currency: "ر.س", // <- غيّر العملة إذا لزم (مثلاً: ر.ع، د.إ، د.ك، ر.ق)
  mixPrice: 45, // سعر العلبة المشكّلة (3 نكهات × حبّتان)
};

/* ---------- النكهات ---------- */
const COOKIES = [
  { id: "classic", name: "رقائق الشوكولاتة", price: 45, color: "#d8a468", bit: "chip",
    ingredients: "زبدة محمّرة، دقيق، سكر بني، بيض، شوكولاتة داكنة، ملح البحر." },
  { id: "double", name: "الشوكولاتة المزدوجة", price: 50, color: "#b08a76", bit: "cocoa",
    ingredients: "كاكاو، زبدة، سكر بني، بيض، قطع شوكولاتة، رشّة ملح." },
  { id: "oat", name: "الشوفان والزبيب", price: 40, color: "#cdb486", bit: "oat",
    ingredients: "شوفان، زبيب، زبدة، سكر بني، قرفة، بيض." },
  { id: "pb", name: "زبدة الفول السوداني", price: 45, color: "#d9a066", bit: "peanut",
    ingredients: "زبدة فول سوداني، فول سوداني محمّص، زبدة، سكر، بيض." },
  { id: "dates", name: "التمر والجوز", price: 45, color: "#bf9474", bit: "date",
    ingredients: "تمر، جوز محمّص، زبدة، سكر بني، قرفة، دقيق." },
  { id: "redvelvet", name: "ريد فلفت", price: 50, color: "#cf8e90", bit: "white",
    ingredients: "دقيق، كاكاو، زبدة، سكر، بيض، شوكولاتة بيضاء." },
  { id: "smores", name: "سمورز", price: 55, color: "#c9a487", bit: "marsh",
    ingredients: "بسكويت غراهام، مارشملو، شوكولاتة الحليب، زبدة، سكر بني." },
  { id: "pistachio", name: "الفستق والهيل", price: 55, color: "#aab687", bit: "pistachio",
    ingredients: "فستق حلبي، هيل، زبدة، سكر، شوكولاتة بيضاء، دقيق." },
];
const N = COOKIES.length;

const STEPS = [
  { head: ["مكوّنات", "حقيقية"], cap: ["زبدة طبيعية، بيض، شوكولاتة فاخرة.", "لا شيء صناعي."], ry: 0 },
  { head: ["عجينة ترتاح", "ليلة كاملة"], cap: ["نحمّر الزبدة ونترك العجينة", "حتى تتعمّق النكهة."], ry: 180 },
  { head: ["تُخبز صباح", "يوم الاستلام"], cap: ["من الفرن إلى علبتك", "في نفس اليوم."], ry: 360 },
  { head: null, cap: ["علبة 6 حبات", ""], ry: 720 },
];

/* =========================================================
   رسومات الكوكيز والمكوّنات (SVG)
   ========================================================= */
const STYLES = {
  classic:   { dough: ["#e9b46e", "#b8732f"], chip: "#3d1c0b", chips: 9 },
  double:    { dough: ["#8a4f2c", "#4f2812"], chip: "#2a1207", chips: 8, flecks: "#f3e6d4" },
  oat:       { dough: ["#e8c48a", "#b98a4c"], chip: "#5e2a3a", chips: 7, oats: true },
  pb:        { dough: ["#e9ad62", "#b67533"], chip: "#c98c45", chips: 0, crosshatch: true, nuts: 6 },
  dates:     { dough: ["#e2b373", "#a96d32"], chip: "#5a2a12", chips: 7, nuts: 5 },
  redvelvet: { dough: ["#b3313a", "#7a1a22"], chip: "#fff6ea", chips: 9 },
  smores:    { dough: ["#d99a55", "#9d6128"], chip: "#3a1a0a", chips: 5, marshmallow: true },
  pistachio: { dough: ["#ead59c", "#bf9f5c"], chip: "#7c9a3c", chips: 0, nuts: 9, drizzle: true },
};

let svgUid = 0;
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f1 = (n) => n.toFixed(1);
function blobPath(rand, cx, cy, r, wobble, points) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r + (rand() - 0.5) * wobble;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], n = pts[(i + 1) % pts.length];
    if (i === 0) {
      const prev = pts[pts.length - 1];
      d += "M" + f1((prev[0] + p[0]) / 2) + " " + f1((prev[1] + p[1]) / 2);
    }
    d += " Q" + f1(p[0]) + " " + f1(p[1]) + " " + f1((p[0] + n[0]) / 2) + " " + f1((p[1] + n[1]) / 2);
  }
  return d + "Z";
}
function randomPointInCircle(rand, r) {
  const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
  return [50 + Math.cos(a) * d, 50 + Math.sin(a) * d];
}

function cookieSVG(kind) {
  const s = STYLES[kind] || STYLES.classic;
  const rand = rng(hashString(kind));
  const id = "ck" + (++svgUid);
  const outline = blobPath(rand, 50, 50, 43, 4, 16);
  let o = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">';
  o += '<defs><radialGradient id="' + id + 'g" cx="42%" cy="38%" r="70%"><stop offset="0%" stop-color="' + s.dough[0] + '"/><stop offset="70%" stop-color="' + s.dough[0] + '"/><stop offset="100%" stop-color="' + s.dough[1] + '"/></radialGradient>';
  o += '<clipPath id="' + id + 'c"><path d="' + outline + '"/></clipPath></defs>';
  o += '<path d="' + outline + '" fill="url(#' + id + 'g)" stroke="' + s.dough[1] + '" stroke-width="1.5"/>';
  o += '<g clip-path="url(#' + id + 'c)">';
  for (let i = 0; i < 6; i++) {
    const p = randomPointInCircle(rand, 30), a = rand() * Math.PI, len = 6 + rand() * 8;
    const x2 = p[0] + Math.cos(a) * len, y2 = p[1] + Math.sin(a) * len;
    const qx = (p[0] + x2) / 2 + (rand() - 0.5) * 6, qy = (p[1] + y2) / 2 + (rand() - 0.5) * 6;
    o += '<path d="M' + f1(p[0]) + " " + f1(p[1]) + " Q" + f1(qx) + " " + f1(qy) + " " + f1(x2) + " " + f1(y2) + '" stroke="' + s.dough[1] + '" stroke-opacity="0.45" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }
  o += '<ellipse cx="38" cy="34" rx="16" ry="9" fill="#fff" opacity="0.12" transform="rotate(-25 38 34)"/>';
  if (s.flecks) for (let i = 0; i < 14; i++) { const p = randomPointInCircle(rand, 36); o += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="0.9" fill="' + s.flecks + '" opacity="0.8"/>'; }
  if (s.oats) for (let i = 0; i < 10; i++) {
    const p = randomPointInCircle(rand, 34);
    o += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="3.6" ry="1.8" fill="#f4dfb4" stroke="#c9a46a" stroke-width="0.5" transform="rotate(' + f1(rand() * 180) + " " + f1(p[0]) + " " + f1(p[1]) + ')"/>';
  }
  if (s.crosshatch) for (let i = -3; i <= 3; i++) {
    const q = i * 7;
    o += '<path d="M' + f1(20 + q) + " 20 L" + f1(80 + q) + ' 80" stroke="' + s.dough[1] + '" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>';
    o += '<path d="M' + f1(80 + q) + " 20 L" + f1(20 + q) + ' 80" stroke="' + s.dough[1] + '" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>';
  }
  if (s.marshmallow) {
    o += '<path d="' + blobPath(rand, 50, 52, 15, 5, 9) + '" fill="#fffaf0" stroke="#e8cfa6" stroke-width="1"/>';
    o += '<path d="' + blobPath(rand, 53, 49, 7, 3, 7) + '" fill="#d9a066" opacity="0.55"/>';
  }
  for (let i = 0; i < s.chips; i++) {
    const p = randomPointInCircle(rand, 32);
    if (s.marshmallow && Math.hypot(p[0] - 50, p[1] - 52) < 17) continue;
    const r = 3.2 + rand() * 2.6;
    o += '<path d="' + blobPath(rand, p[0], p[1], r, r * 0.6, 5) + '" fill="' + s.chip + '"/>';
    o += '<circle cx="' + f1(p[0] - r * 0.3) + '" cy="' + f1(p[1] - r * 0.35) + '" r="' + f1(r * 0.25) + '" fill="#fff" opacity="0.18"/>';
  }
  if (s.nuts) for (let i = 0; i < s.nuts; i++) {
    const p = randomPointInCircle(rand, 32);
    const fill = kind === "pistachio" ? (i % 2 ? "#8aa84a" : "#a9c063") : kind === "dates" ? "#c9a06a" : "#c98c45";
    o += '<path d="' + blobPath(rand, p[0], p[1], 2.8, 1.6, 6) + '" fill="' + fill + '" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>';
  }
  if (s.drizzle) {
    let d = "M8 34";
    for (let i = 0; i < 6; i++) d += " Q" + f1(16 + i * 15) + " " + f1(18 + rand() * 50) + " " + f1(22 + i * 15) + " " + f1(30 + rand() * 40);
    o += '<path d="' + d + '" stroke="#fffaf0" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.95"/>';
  }
  return o + "</g></svg>";
}

/* قطع المكوّنات: مجموعة صغيرة لكل نكهة */
function bitSVG(kind, salt) {
  const rand = rng(hashString(kind + (salt || "")));
  let o = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">';
  const chunk = (cx, cy, r, fill, hi) =>
    '<path d="' + blobPath(rand, cx, cy, r, r * 0.55, 6) + '" fill="' + fill + '"/>' +
    '<path d="' + blobPath(rand, cx - r * 0.25, cy - r * 0.3, r * 0.42, r * 0.2, 5) + '" fill="' + hi + '" opacity="0.4"/>';
  const ell = (cx, cy, rx, ry, rot, fill, stroke) =>
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + rot + " " + cx + " " + cy + ')" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2"' : "") + "/>";
  switch (kind) {
    case "chip": o += chunk(38, 42, 20, "#3d1c0b", "#9a6a48") + chunk(66, 60, 15, "#4a2410", "#9a6a48") + chunk(42, 74, 11, "#2f1407", "#8a5a3c"); break;
    case "cocoa": o += chunk(42, 48, 22, "#2a1207", "#7a4a30") + chunk(70, 66, 13, "#3a1a0a", "#7a4a30");
      for (let i = 0; i < 6; i++) o += '<rect x="' + f1(20 + rand() * 60) + '" y="' + f1(18 + rand() * 60) + '" width="5" height="4" rx="1" fill="#fff" opacity="0.92" transform="rotate(' + f1(rand() * 90) + ' 50 50)"/>';
      break;
    case "oat": o += ell(36, 38, 16, 9, -20, "#f2dcae", "#c9a46a") + ell(62, 44, 15, 8, 30, "#efd6a2", "#c9a46a") + ell(46, 66, 14, 8, 10, "#f4e1b8", "#c9a46a") + chunk(70, 70, 8, "#5e2a3a", "#a0607a") + chunk(28, 62, 7, "#542436", "#a0607a"); break;
    case "peanut":
      [[38, 40, -25], [64, 58, 20], [40, 70, 60]].forEach(([x, y, r]) => {
        o += '<g transform="rotate(' + r + " " + x + " " + y + ')"><ellipse cx="' + (x - 7) + '" cy="' + y + '" rx="10" ry="9" fill="#d9a35f"/><ellipse cx="' + (x + 7) + '" cy="' + y + '" rx="10" ry="9" fill="#d29a55"/><path d="M' + (x - 12) + " " + (y - 3) + " h24" + '" stroke="#b07a3c" stroke-width="1.2" opacity=".6"/></g>';
      });
      break;
    case "date": o += ell(40, 44, 24, 11, -30, "#5a2a12") + ell(36, 40, 12, 4, -30, "#8a4a26") + ell(64, 66, 20, 10, 20, "#4a2210") + chunk(68, 34, 11, "#b98545", "#e0b47a"); break;
    case "white": o += chunk(40, 42, 15, "#fff3dc", "#ffffff") + chunk(64, 58, 13, "#fbe9cc", "#ffffff") + chunk(40, 70, 11, "#fff3dc", "#ffffff") + chunk(70, 32, 8, "#a0242c", "#d66"); break;
    case "marsh":
      o += '<rect x="22" y="28" width="34" height="30" rx="10" fill="#fffaf0" stroke="#ead6b4" stroke-width="1.5"/><rect x="22" y="44" width="34" height="14" rx="7" fill="#e0a868" opacity=".55"/>';
      o += '<rect x="50" y="50" width="28" height="26" rx="9" fill="#fffaf0" stroke="#ead6b4" stroke-width="1.5" transform="rotate(14 64 63)"/>';
      o += chunk(36, 74, 10, "#4a2511", "#8a5a3c"); break;
    case "pistachio":
      [[34, 40, 20, "#8aa84a"], [60, 36, -30, "#a9c063"], [46, 62, 50, "#93b052"], [70, 64, 10, "#a2bb5c"]].forEach(([x, y, r, c]) => {
        o += ell(x, y, 12, 8, r, c) + ell(x + 3, y - 2, 6, 3, r, "#7a4a6a");
      });
      o += ell(28, 70, 9, 6, 40, "#b7c27a", "#8f9a52"); break;
    default: o += chunk(50, 50, 20, "#3d1c0b", "#9a6a48");
  }
  return o + "</svg>";
}

/* =========================================================
   أدوات مساعدة
   ========================================================= */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const money = (n) => n.toLocaleString("en-US") + " " + SHOP.currency;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const flavOf = (j) => ((j % N) + N) % N;
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)");
const D2R = Math.PI / 180;
const DIR = -1; // اتجاه من اليمين لليسار: النكهة التالية تأتي من اليسار

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 28; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
const GLIDE = bezier(0.25, 0.75, 0.2, 1);
const ENTRY = bezier(0.16, 1, 0.3, 1);

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
function mixHex(a, b, t) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(lerp((A >> s) & 255, (B >> s) & 255, t));
  return "rgb(" + ch(16) + "," + ch(8) + "," + ch(0) + ")";
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2400);
}

/* =========================================================
   عناصر الصفحة
   ========================================================= */
const root = document.documentElement;
const body = document.body;
const hero = $("#flavors");
const arcEl = $("#arc");
const revealEl = $("#reveal");
const titleEl = $("#title");
const countEl = $("#count");
const playBtn = $("#play");
const autoBtn = $("#auto");
const inside = $("#inside");
const inBar = $("#inBar");
const inFront = $("#inFront");
const inFrontFrame = $("#inFrontFrame");
const inHead = $("#inHead");
const inCap = $("#inCap");
const inNum = $("#inNum");
const inDark = $("#inDark");
const inIcons = $$("#inIcons button");
const shop = $("#shop");
const cardsEl = $("#cards");
const range = $("#range");
const nav = $("#nav");
const pill = $("#pill");
const pillHL = $(".hl", pill);
const pillLinks = $$("a", pill);
const intro = $("#intro");

/* ---------- رسومات ثابتة ---------- */
$$("[data-cookie]").forEach((el) => { el.innerHTML = cookieSVG(el.getAttribute("data-cookie")); });
$$(".stars").forEach((el) => {
  el.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'.repeat(5);
});
$("#year").textContent = new Date().getFullYear();

/* ---------- قطع المكوّنات الطافية في الواجهة ---------- */
const BITS = [
  { x: 0.12, y: 0.2, s: 120, r: -18, k: "chip" },
  { x: 0.86, y: 0.18, s: 96, r: 22, k: "pistachio" },
  { x: 0.07, y: 0.74, s: 84, r: 12, k: "oat" },
  { x: 0.655, y: 0.15, s: 78, r: -10, k: "date" },
  { x: 0.205, y: 0.885, s: 70, r: 30, k: "marsh" },
];
const bitEls = BITS.map((b, i) => {
  const el = document.createElement("div");
  el.className = "bit" + (i === 1 || i === 3 || i === 4 ? " ph-off" : "");
  el.style.cssText = "left:" + b.x * 100 + "%;top:" + b.y * 100 + "%;width:calc(" + b.s + " * var(--u) * var(--bs, 1));aspect-ratio:1;rotate:" + b.r + "deg";
  el.innerHTML = bitSVG(b.k, "hero" + i);
  $("#bits").append(el);
  return el;
});

/* ---------- بطاقات المتجر ---------- */
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const XSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
function twoLines(name) {
  const w = name.split(" ");
  if (w.length < 2) return esc(name);
  const cut = Math.ceil(w.length / 2);
  return esc(w.slice(0, cut).join(" ")) + "<br>" + esc(w.slice(cut).join(" "));
}
cardsEl.innerHTML = COOKIES.map((c, i) =>
  '<li class="card" style="--c:' + c.color + '" data-i="' + i + '">' +
    '<h3 class="nm disp">' + twoLines(c.name) + "</h3>" +
    '<span class="pk spr">' + cookieSVG(c.id) + "</span>" +
    '<p class="pr">' + money(c.price) + "<small>علبة 6 حبات</small></p>" +
    '<button type="button" class="add" aria-label="أضف علبة ' + esc(c.name) + ' إلى السلة">' + PLUS + "</button>" +
  "</li>").join("");
const cards = $$(".card", cardsEl);
const cardState = cards.map(() => ({ tx: 0, ty: 0, poke: -1 }));

/* ---------- مصغّرات صانع العلبة ---------- */
$("#thumbs").innerHTML = COOKIES.map((c, i) =>
  '<li><button type="button" class="thumb" style="--c:' + c.color + '" data-i="' + i + '" aria-label="أضف ' + esc(c.name) + ' إلى علبتك">' +
    '<span class="sq"><span>' + cookieSVG(c.id) + "</span></span>" +
    '<span class="lb">' + esc(c.name) + "</span>" +
    '<span class="rg" aria-hidden="true"></span>' +
  "</button></li>").join("");
const thumbs = $$(".thumb");

/* ---------- قطع العاصفة ---------- */
const stormEl = $("#storm");
const stormRand = rng(20261124);
const pieces = Array.from({ length: 20 }, (_, i) => {
  const el = document.createElement("div");
  el.className = "piece";
  const own = stormRand() < 0.7;
  const p = {
    el, own,
    kind: own ? null : COOKIES[Math.floor(stormRand() * N)].bit,
    a: stormRand() * Math.PI * 2,
    ph: i / 20 + stormRand() * 0.03,
    spin: (stormRand() < 0.5 ? -1 : 1) * 360,
    size: 0.7 + stormRand() * 0.7,
  };
  stormEl.append(el);
  return p;
});
function paintPieces() {
  pieces.forEach((p, i) => { p.el.innerHTML = bitSVG(p.own ? COOKIES[curFlav].bit : p.kind, "storm" + i); });
}

/* =========================================================
   الحالة العامة
   ========================================================= */
let vw = innerWidth, vh = innerHeight, isPhone = vw < 820;
let U = 1, XS = 1;
let pos = -2.6, target = 0, curFlav = 0;
let posTween = null, reveal = null;
let entered = false, auto = !RM, lastInteract = 0;
let drag = null;
let step = -1, flipAngle = 0, flip = null;
let liveIdx = -1, stripCentred = false;
let heroVis = 1;
let GL = null;

/* =========================================================
   العنوان والعدّاد
   ========================================================= */
const measureCtx = document.createElement("canvas").getContext("2d");
function textW(s) { measureCtx.font = "100px Lalezar"; return measureCtx.measureText(s).width || 1; }
function sizeTitle(name) {
  let size;
  if (isPhone) {
    const longest = Math.max(...name.split(" ").map(textW));
    size = Math.min(clamp(0.125 * vw, 40, 64), ((vw - 36) * 100) / longest);
  } else {
    const u = Math.min(vw / 1440, vh / 900);
    size = Math.min(96 * u, (760 * u * 100) / textW(name));
  }
  titleEl.style.fontSize = size.toFixed(1) + "px";
}
function titleLine(name) {
  const line = document.createElement("span");
  line.className = "tl";
  line.innerHTML = name.split(" ").map((w) => '<span class="tw">' + esc(w) + "</span>").join(" ");
  return line;
}
function swapTitle(name, dir) {
  sizeTitle(name);
  const old = $$(".tl", titleEl);
  const line = titleLine(name);
  titleEl.append(line);
  if (RM) { old.forEach((o) => o.remove()); return; }
  // الكلمات تتحرك كوحدة كاملة حتى لا تنفصل الحروف العربية
  old.forEach((o) => {
    o.setAttribute("aria-hidden", "true");
    const ws = $$(".tw", o);
    ws.forEach((w, i) => w.animate(
      [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(" + -110 * dir + "%)", opacity: 0 }],
      { duration: 300, delay: i * 30, easing: "cubic-bezier(.45,0,.75,.3)", fill: "forwards" }));
    setTimeout(() => o.remove(), 340 + ws.length * 30);
  });
  $$(".tw", line).forEach((w, i) => w.animate(
    [{ transform: "translateY(" + 110 * dir + "%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
    { duration: 620, delay: 120 + i * 45, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
}
function swapCount(fi) {
  const txt = String(fi + 1).padStart(2, "0");
  if (RM || !entered) { countEl.textContent = txt; return; }
  countEl.getAnimations().forEach((a) => { if (a.id === "cnt") a.cancel(); });
  const out = countEl.animate([{ translate: "0 0", opacity: 1 }, { translate: "0 -10px", opacity: 0 }],
    { duration: 220, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards", id: "cnt" });
  setTimeout(() => {
    out.cancel();
    countEl.textContent = txt;
    countEl.animate([{ translate: "0 14px", opacity: 0 }, { translate: "0 0", opacity: 1 }],
      { duration: 380, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards", id: "cnt" });
  }, 280);
}

/* ---------- تبديل النكهة ---------- */
function startReveal(color) {
  if (reveal) finishReveal();
  if (RM || !entered) { root.style.setProperty("--flav", color); return; }
  revealEl.style.setProperty("--rv", color);
  reveal = { t0: performance.now(), color };
}
function finishReveal() {
  if (!reveal) return;
  root.style.setProperty("--flav", reveal.color);
  revealEl.style.removeProperty("--rv");
  revealEl.style.removeProperty("mask-image");
  revealEl.style.removeProperty("-webkit-mask-image");
  reveal = null;
}
function changeFlavour(fi, dir) {
  if (fi === curFlav) return;
  curFlav = fi;
  const c = COOKIES[fi];
  startReveal(c.color);
  swapTitle(c.name, dir || 1);
  swapCount(fi);
  paintPieces();
  if (step === 3) crossfadeInside(3);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = c.color;
  if (!GL) paintFallback();
}

function goTo(to, opts) {
  opts = opts || {};
  to = Math.round(to);
  const from = pos;
  const extra = Math.max(0, Math.abs(to - target) - 1);
  const dur = opts.dur != null ? opts.dur : 650 + 160 * extra;
  const dir = Math.sign(to - target) || Math.sign(to - from) || 1;
  target = to;
  const fire = opts.fire !== false;
  if (RM) {
    pos = to; posTween = null;
    if (fire) changeFlavour(flavOf(to), dir);
    return;
  }
  posTween = { from, to, t0: performance.now(), dur, ease: opts.ease || GLIDE, fire: fire && flavOf(to) !== curFlav, fired: false, dir };
}
function interact() { lastInteract = performance.now(); }
function next(d) { interact(); goTo(target + d); }

/* =========================================================
   قسم «من الداخل»
   ========================================================= */
function insideHTML(s) {
  const c = COOKIES[curFlav];
  const head = STEPS[s].head || c.name.split(" ");
  const cap = s === 3 ? ["علبة 6 حبات", "بـ " + money(c.price)] : STEPS[s].cap;
  return {
    head: head.map((w) => '<span class="hw' + (w.length > 9 ? " long" : "") + '">' + esc(w) + "</span>").join(""),
    cap: cap.map(esc).join("<br>"),
    num: String(s + 1).padStart(2, "0"),
  };
}
function softSwap(el, apply) {
  if (RM) { apply(); return; }
  el.getAnimations().forEach((a) => a.cancel());
  const out = el.animate([{ translate: "0 0", opacity: 1 }, { translate: "0 -10px", opacity: 0 }], { duration: 240, easing: "ease-in", fill: "forwards" });
  setTimeout(() => {
    out.cancel();
    apply();
    el.animate([{ translate: "0 14px", opacity: 0 }, { translate: "0 0", opacity: 1 }], { duration: 460, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
  }, 280);
}
function crossfadeInside(s, instant) {
  const h = insideHTML(s);
  const apply = () => {
    inHead.innerHTML = h.head;
    inCap.innerHTML = h.cap;
    inNum.textContent = h.num;
  };
  if (instant) { apply(); return; }
  softSwap(inHead, () => { inHead.innerHTML = h.head; });
  softSwap(inCap, () => { inCap.innerHTML = h.cap; });
  softSwap(inNum, () => { inNum.textContent = h.num; });
}
function setStep(s) {
  if (s === step) return;
  const first = step < 0;
  step = s;
  inIcons.forEach((b, i) => { b.classList.toggle("on", i === s); b.setAttribute("aria-current", i === s ? "step" : "false"); });
  const to = STEPS[s].ry;
  const halfTurns = clamp(Math.abs(to - flipAngle) / 180, 0.4, 2);
  const dur = RM || first ? 0 : 720 * halfTurns;
  flip = { from: flipAngle, to, t0: performance.now(), dur };
  if (first) { flipAngle = to; crossfadeInside(s, true); return; }
  setTimeout(() => crossfadeInside(s), RM ? 0 : 0.38 * Math.min(dur, 720));
}
inIcons.forEach((b, i) => b.addEventListener("click", () => {
  const top = inside.getBoundingClientRect().top + scrollY;
  const span = inside.offsetHeight - vh;
  scrollToY(top + (i + 0.5) * 0.19 * span);
}));

/* =========================================================
   المحرك ثلاثي الأبعاد
   ========================================================= */
async function svgImage(svg, size) {
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", '<svg width="' + size + '" height="' + size + '" '));
  await img.decode();
  return img;
}
function wrapLines(ctx, text, maxW) {
  const words = text.split(" "), lines = [];
  let line = "";
  words.forEach((w) => {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  });
  if (line) lines.push(line);
  return lines;
}
async function cookieTextures(THREE, renderer, i) {
  const c = COOKIES[i], st = STYLES[c.id], S = 768;
  const img = await svgImage(cookieSVG(c.id), S);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const fc = document.createElement("canvas"); fc.width = fc.height = S;
  fc.getContext("2d").drawImage(img, 0, 0, S, S);

  // الوجه الخلفي: قاع الكوكيز مع ملصق المخبز
  const bc = document.createElement("canvas"); bc.width = bc.height = S;
  const x = bc.getContext("2d");
  x.save(); x.translate(S, 0); x.scale(-1, 1); x.drawImage(img, 0, 0, S, S); x.restore();
  x.globalCompositeOperation = "source-atop";
  x.fillStyle = mixHex(st.dough[1], st.dough[0], 0.35);
  x.fillRect(0, 0, S, S);
  const g = x.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.45);
  g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(0.75, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.28)");
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const sr = rng(hashString(c.id + "under"));
  for (let k = 0; k < 220; k++) {
    const a = sr() * Math.PI * 2, d = Math.sqrt(sr()) * S * 0.42;
    x.fillStyle = sr() < 0.5 ? "rgba(60,30,10,.22)" : "rgba(255,240,215,.22)";
    x.beginPath(); x.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, 1 + sr() * 2.2, 0, Math.PI * 2); x.fill();
  }
  x.globalCompositeOperation = "source-over";
  const cx = S / 2, cy = S / 2, R = S * 0.235;
  x.fillStyle = "#fbf4e6";
  x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fill();
  x.lineWidth = S * 0.008; x.strokeStyle = c.color; x.stroke();
  x.setLineDash([S * 0.012, S * 0.01]); x.lineWidth = S * 0.003; x.strokeStyle = "rgba(42,22,11,.3)";
  x.beginPath(); x.arc(cx, cy, R * 0.9, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
  const ink = mixHex(c.color, "#1c1a1f", 0.78);
  x.fillStyle = ink; x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl";
  x.font = Math.round(S * 0.056) + "px Lalezar";
  x.fillText("كوكيز البيت", cx, cy - S * 0.13);
  x.font = "700 " + Math.round(S * 0.034) + 'px "Noto Naskh Arabic", serif';
  x.fillText(c.name, cx, cy - S * 0.075);
  x.fillRect(cx - S * 0.12, cy - S * 0.047, S * 0.24, S * 0.003);
  x.font = "700 " + Math.round(S * 0.025) + 'px "Noto Naskh Arabic", serif';
  x.fillText("المكوّنات", cx, cy - S * 0.018);
  x.font = Math.round(S * 0.025) + 'px "Noto Naskh Arabic", serif';
  wrapLines(x, c.ingredients, S * 0.36).slice(0, 3).forEach((ln, k) => x.fillText(ln, cx, cy + S * 0.022 + k * S * 0.036));
  x.font = "600 " + Math.round(S * 0.023) + 'px "Noto Naskh Arabic", serif';
  x.fillText("مخبوزة في البيت · بلا مواد حافظة", cx, cy + S * 0.168);

  const mk = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  return [mk(fc), mk(bc)];
}
function surface(THREE, sign) {
  const g = new THREE.PlaneGeometry(1, 1, 64, 64);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    const rr = Math.hypot(u - 0.5, v - 0.5) / 0.43;
    const across = Math.pow(Math.max(0, 1 - Math.pow(rr, 2.4)), 0.55);
    let z;
    if (sign > 0) z = 0.006 + 0.072 * across + 0.005 * Math.sin(19 * u + 23 * v) * Math.sin(13 * u - 17 * v) * across;
    else z = -(0.004 + 0.03 * Math.pow(across, 0.7));
    p.setZ(i, z);
    if (sign < 0) uv.setX(i, 1 - u);
  }
  if (sign < 0) {
    const idx = g.index;
    for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i + 1); idx.setX(i + 1, idx.getX(i + 2)); idx.setX(i + 2, a); }
  }
  g.computeVertexNormals();
  return g;
}

async function initGL() {
  try {
    const THREE = await import("three");
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
    await Promise.all([
      document.fonts.load("40px Lalezar"),
      document.fonts.load('400 20px "Noto Naskh Arabic"'),
      document.fonts.load('700 20px "Noto Naskh Arabic"'),
    ]).catch(() => {});
    const canvas = $("#gl");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-0.6, 0.9, 1.4);
    scene.add(key);
    const camera = new THREE.PerspectiveCamera(30, 1, 10, 4000);

    const geoF = surface(THREE, 1), geoB = surface(THREE, -1);
    const texF = [], texB = [];
    for (let i = 0; i < N; i++) { const [a, b] = await cookieTextures(THREE, renderer, i); texF.push(a); texB.push(b); }

    const sc = document.createElement("canvas"); sc.width = sc.height = 128;
    const sx = sc.getContext("2d");
    const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sg.addColorStop(0, "rgba(30,18,40,.55)"); sg.addColorStop(1, "rgba(30,18,40,0)");
    sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(sc);
    const shadowGeo = new THREE.PlaneGeometry(1, 1);

    function makeBar() {
      const group = new THREE.Group();
      group.rotation.order = "ZYX";
      const opts = { transparent: true, alphaTest: 0.5, roughness: 0.78, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.6, envMapIntensity: 0.35 };
      const mf = new THREE.MeshPhysicalMaterial(opts), mb = new THREE.MeshPhysicalMaterial(opts);
      const front = new THREE.Mesh(geoF, mf), back = new THREE.Mesh(geoB, mb);
      group.add(front, back);
      const sm = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
      const shadow = new THREE.Mesh(shadowGeo, sm);
      shadow.renderOrder = -1;
      scene.add(group, shadow);
      const bar = { group, front, back, shadow, mf, mb, sm, flav: -1, j: null };
      front.userData.bar = back.userData.bar = bar;
      return bar;
    }
    function setFlav(bar, i) {
      if (bar.flav === i) return;
      const first = bar.flav < 0;
      bar.flav = i;
      bar.mf.map = texF[i]; bar.mb.map = texB[i];
      if (first) { bar.mf.needsUpdate = true; bar.mb.needsUpdate = true; }
    }
    function place(bar, S) {
      if (!S || S.op <= 0.01) { bar.group.visible = false; bar.shadow.visible = false; return; }
      bar.group.visible = true;
      const X = S.x - vw / 2, Y = vh / 2 - S.y, Z = S.z || 0, h = S.h;
      bar.group.position.set(X, Y, Z);
      bar.group.scale.set(h * (S.sx || 1), h * (S.sy || 1), h);
      bar.group.rotation.set((S.rx || 0) * D2R, S.ry * D2R, -(S.rz || 0) * D2R, "ZYX");
      bar.mf.opacity = bar.mb.opacity = S.op;
      const sf = S.shadow == null ? 1 : S.shadow;
      if (sf * S.op < 0.01) { bar.shadow.visible = false; return; }
      bar.shadow.visible = true;
      bar.shadow.position.set(X, Y - 0.05 * h, Z - 0.32 * h);
      bar.shadow.scale.set(1.05 * h * Math.max(0.3, Math.abs(Math.cos(S.ry * D2R))), h, 1);
      bar.shadow.rotation.z = -(S.rz || 0) * D2R;
      bar.sm.opacity = 0.5 * S.op * sf;
    }
    function resize() {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, vw < 820 ? 1.75 : 2));
      renderer.setSize(vw, vh, false);
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      const D = clamp(1500 * Math.min(vw / 1440, vh / 900), 1000, 2200);
      camera.position.set(0, 0, D);
      camera.fov = (2 * Math.atan(vh / 2 / D) * 180) / Math.PI;
      camera.aspect = vw / vh;
      camera.near = 10; camera.far = 4 * D;
      camera.updateProjectionMatrix();
    }
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pool = Array.from({ length: 11 }, makeBar);
    const trav = makeBar();
    function pick(clientX, clientY) {
      ndc.set((clientX / vw) * 2 - 1, -(clientY / vh) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const objs = [];
      [...pool, trav].forEach((b) => { if (b.group.visible && b.mf.opacity > 0.3) objs.push(b.front, b.back); });
      const hits = ray.intersectObjects(objs, false);
      for (const h of hits) if (h.uv && Math.hypot(h.uv.x - 0.5, h.uv.y - 0.5) < 0.43) return h.object.userData.bar;
      return null;
    }
    GL = { renderer, scene, camera, pool, trav, setFlav, place, resize, pick };
    resize();
    body.classList.add("gl");
  } catch (err) {
    console.warn("3D غير متاح، سيُستخدم العرض المسطّح:", err);
    GL = null;
    body.classList.add("no-gl");
    paintFallback();
  }
}
function paintFallback() {
  const id = COOKIES[curFlav].id;
  $("#heroFallback").innerHTML = cookieSVG(id);
  inBar.innerHTML = cookieSVG(id);
}

/* ---------- مواضع القوس ---------- */
// [dx, dy, ارتفاع, rz, ry] بوحدات u لكل خانة من المركز
const SLOTS = [[0, 0, 380, 0, 0], [300, 30, 300, 4, 18], [560, 56, 276, 8, 28], [800, 92, 256, 12, 36], [1020, 128, 240, 15, 42]];
function arcSlot(k) {
  const a = Math.min(Math.abs(k), 4), i = Math.floor(a), f = a - i;
  const s0 = SLOTS[i], s1 = SLOTS[Math.min(i + 1, 4)];
  const L = (n) => s0[n] + (s1[n] - s0[n]) * f;
  const sg = Math.sign(k);
  const ak = Math.abs(k);
  return { dx: sg * L(0), dy: L(1), h: L(2), rz: sg * L(3), ry: sg * L(4), z: -ak * 34, op: ak <= 3.3 ? 1 : clamp(1 - (ak - 3.3) / 0.6) };
}
let AX = 0, AY = 0;
function arcFor(j, now) {
  const s = arcSlot(j - pos);
  const b = RM ? 0 : Math.sin((now / 4600) * Math.PI * 2 + 1.37 * j);
  return {
    x: AX + DIR * s.dx * U * XS,
    y: AY + s.dy * U - (RM ? 0 : (0.5 * b + 0.5) * 9 * U),
    h: s.h * U,
    rz: DIR * s.rz + (RM ? 0 : 0.4 * b),
    ry: DIR * s.ry, rx: 0,
    z: s.z * U, op: s.op, shadow: 1, sx: 1, sy: 1,
  };
}
function lerpState(a, b, t) {
  const o = {};
  for (const k of ["x", "y", "h", "rz", "ry", "rx", "z", "op", "shadow", "sx", "sy"]) o[k] = lerp(a[k] || 0, b[k] == null ? 0 : b[k], t);
  return o;
}
function pokeScale(st, now) {
  if (st.poke < 0) return [1, 1];
  const t = (now - st.poke) / 500;
  if (t >= 1) { st.poke = -1; return [1, 1]; }
  const k = [[0, 1, 1], [0.3, 1.06, 0.93], [0.6, 0.97, 1.04], [1, 1, 1]];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const f = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
    return [lerp(k[i - 1][1], k[i][1], f), lerp(k[i - 1][2], k[i][2], f)];
  }
  return [1, 1];
}

/* =========================================================
   الحلقة الرئيسية
   ========================================================= */
let lastT = performance.now();
const navSecs = ["flavors", "inside", "shop", "range", "order"].map((id) => document.getElementById(id));
let activeSec = "";
let navTheme = "";

function frame(now) {
  const dt = Math.min(64, now - lastT);
  lastT = now;
  smoothStep(dt);

  // حركة القوس
  if (posTween) {
    const t = (now - posTween.t0) / posTween.dur;
    pos = lerp(posTween.from, posTween.to, posTween.ease(Math.min(1, t)));
    if (posTween.fire && !posTween.fired && t >= 0.12) { posTween.fired = true; changeFlavour(flavOf(posTween.to), posTween.dir); }
    if (t >= 1) { pos = posTween.to; posTween = null; }
  }

  // الواجهة
  const hr = hero.getBoundingClientRect();
  const H = hr.height;
  if (isPhone) { U = Math.min(vw / 560, H / 980); XS = 1.02; AY = hr.top + 0.4 * H; }
  else { U = Math.min(vw / 1440, vh / 900); XS = 1; AY = hr.top + H / 2 - 78 * U; }
  AX = vw / 2;
  heroVis = clamp((Math.min(vh, hr.bottom) - Math.max(0, hr.top)) / H);

  // دائرة اللون
  if (reveal) {
    const t = (now - reveal.t0) / 420;
    const mx = AX - hr.left, my = AY - hr.top;
    const far = Math.max(Math.hypot(mx, my), Math.hypot(hr.width - mx, my), Math.hypot(mx, H - my), Math.hypot(hr.width - mx, H - my));
    const r = 1.45 * far * GLIDE(Math.min(1, t));
    const fe = Math.max(60, 0.35 * r);
    const m = "radial-gradient(circle at " + mx.toFixed(0) + "px " + my.toFixed(0) + "px, #000 " + Math.max(0, r - fe).toFixed(0) + "px, transparent " + r.toFixed(0) + "px)";
    revealEl.style.webkitMaskImage = m;
    revealEl.style.maskImage = m;
    if (t >= 1) finishReveal();
  }

  // التشغيل التلقائي
  if (entered && auto && !drag && !document.hidden && heroVis >= 0.6 && now - lastInteract > 3200) { lastInteract = now; goTo(target + 1); }

  // قسم «من الداخل»
  const ir = inside.getBoundingClientRect();
  const span = Math.max(1, ir.height - vh);
  const p = clamp(-ir.top / span);
  setStep(Math.floor(Math.min(p, 0.759) / 0.19));
  const q = clamp((p - 0.76) / 0.24);
  if (flip) {
    const t = flip.dur ? (now - flip.t0) / flip.dur : 1;
    flipAngle = lerp(flip.from, flip.to, sineInOut(Math.min(1, t)));
    if (t >= 1) { flipAngle = flip.to; flip = null; }
  }
  const pinY = ir.top > 0 ? ir.top : ir.bottom < vh ? ir.bottom - vh : 0;
  const inView = ir.top < vh && ir.bottom > 0;
  inFront.classList.toggle("on", inView);
  if (inView) {
    inFront.style.transform = "translateY(" + pinY.toFixed(1) + "px)";
    const fade = 1 - clamp(4 * q);
    inFrontFrame.style.opacity = fade;
    inNum.style.opacity = fade;
    inDark.style.opacity = (clamp(3.5 * q) * 0.42).toFixed(3);
    updateStorm(q);
  }

  // المتجر
  const sr = shop.getBoundingClientRect();
  const p1 = clamp(1 - ir.top / vh);
  const p3 = clamp((vh - sr.top) / (0.7 * vh));
  const jT = Math.round(target);
  const tf = flavOf(jT);
  if (tf !== liveIdx) {
    if (liveIdx >= 0) cards[liveIdx].classList.remove("live");
    liveIdx = tf;
    cards[tf].classList.add("live");
  }
  if (isPhone && p3 > 0 && !stripCentred) {
    stripCentred = true;
    const cr = cards[tf].getBoundingClientRect(), lr = cardsEl.getBoundingClientRect();
    cardsEl.scrollBy({ left: cr.left + cr.width / 2 - (lr.left + lr.width / 2), behavior: RM ? "auto" : "smooth" });
  }

  updateNav();

  if (GL) {
    // الكوكيز المسافرة
    const A = arcFor(jT, now);
    const br = inBar.getBoundingClientRect();
    const bob = RM ? 0 : Math.sin((now / 2600) * Math.PI * 2) * 6;
    const B = { x: br.left + br.width / 2, y: br.top + br.height / 2 + bob, h: br.height, rz: 14, ry: flipAngle + (RM ? 0 : 720 * q), rx: 0, z: 0, op: 1, shadow: 1, sx: 1, sy: 1 };
    let S = A;
    if (p1 > 0) S = lerpState(A, B, easeInOut(p1));
    if (p3 > 0) {
      const pk = $(".pk", cards[tf]).getBoundingClientRect();
      const cs = cardState[tf];
      const [psx, psy] = pokeScale(cs, now);
      const C = { x: pk.left + pk.width / 2, y: pk.top + pk.height / 2, h: pk.height, rz: 0, ry: Math.round(B.ry / 360) * 360 + cs.tx * 14, rx: -cs.ty * 14, z: 30, op: 1, shadow: 0.7, sx: psx, sy: psy };
      S = lerpState(B, C, easeInOut(p3));
    }
    GL.setFlav(GL.trav, tf);
    GL.trav.j = jT;
    GL.place(GL.trav, S);

    // بقية الكوكيز في القوس
    const heroFade = 1 - clamp(1.6 * p1);
    const base = Math.floor(pos);
    let pi = 0;
    for (let j = base - 5; j <= base + 5 && pi < GL.pool.length; j++) {
      if (j === jT) continue;
      const bar = GL.pool[pi++];
      const st = arcFor(j, now);
      st.op *= heroFade;
      bar.j = j;
      GL.setFlav(bar, flavOf(j));
      GL.place(bar, st);
    }
    for (; pi < GL.pool.length; pi++) GL.place(GL.pool[pi], null);
    GL.renderer.render(GL.scene, GL.camera);
  }

  requestAnimationFrame(frame);
}

function updateStorm(q) {
  const show = q > 0 && q < 1 && !RM;
  const R = 0.55 * Math.hypot(vw, vh);
  const base = 0.085 * Math.min(vw, vh);
  const cx = vw / 2, cy = vh / 2;
  pieces.forEach((pc) => {
    const s = clamp((q - 0.45 * pc.ph) / 0.55);
    if (!show || s <= 0 || s >= 1) { pc.el.style.visibility = "hidden"; return; }
    const size = base * pc.size;
    const rad = (0.06 + Math.pow(s, 1.5) * 0.95) * R;
    const x = cx + Math.cos(pc.a) * rad, y = cy + Math.sin(pc.a) * rad * 0.8;
    const sc = 0.2 + 1.7 * s;
    pc.el.style.visibility = "visible";
    pc.el.style.width = pc.el.style.height = size.toFixed(1) + "px";
    pc.el.style.transform = "translate(" + (x - size / 2).toFixed(1) + "px," + (y - size / 2).toFixed(1) + "px) rotate(" + (pc.spin * s).toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
    pc.el.style.opacity = (Math.sin(Math.PI * s) * clamp(5 * q) * clamp(6 * (1 - q))).toFixed(3);
  });
}

/* ---------- الترويسة ---------- */
function updateNav() {
  let act = "flavors";
  navSecs.forEach((s) => { if (s && s.getBoundingClientRect().top <= vh * 0.35) act = s.id; });
  if (act !== activeSec) {
    activeSec = act;
    pillLinks.forEach((a) => {
      const on = a.dataset.sec === act;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    placeHL();
  }
  const probe = 40;
  const inRect = (el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; };
  let theme = "";
  if (inRect(range)) theme = "dark";
  else if (inRect(shop) || inRect($("#reviews")) || inRect($("#order")) || inRect($(".site-footer"))) theme = "light";
  if (theme !== navTheme) {
    navTheme = theme;
    nav.classList.toggle("dark", theme === "dark");
    nav.classList.toggle("light", theme === "light");
  }
}
function placeHL() {
  const a = pillLinks.find((l) => l.classList.contains("active"));
  if (!a) return;
  pillHL.style.left = a.offsetLeft + "px";
  pillHL.style.width = a.offsetWidth + "px";
}

/* =========================================================
   التفاعل في الواجهة: السحب، النقر، الأزرار، لوحة المفاتيح
   ========================================================= */
arcEl.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  interact();
  drag = { id: e.pointerId, x0: e.clientX, pos0: pos, started: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
});
arcEl.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) {
    if (e.pointerType === "mouse" && GL && !drag) arcEl.classList.toggle("over", !!GL.pick(e.clientX, e.clientY));
    return;
  }
  if (!drag.started) {
    if (Math.abs(e.clientX - drag.x0) <= 6) return;
    drag.started = true;
    posTween = null;
    try { arcEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    body.classList.add("dragging");
    drag.pos0 = pos; drag.x0 = e.clientX; drag.lastX = e.clientX; drag.lastT = e.timeStamp;
  }
  const slotPx = 300 * U * XS;
  pos = drag.pos0 + (e.clientX - drag.x0) / slotPx;
  const dtm = e.timeStamp - drag.lastT;
  if (dtm > 0) drag.v += ((e.clientX - drag.lastX) / slotPx / dtm - drag.v) * 0.4;
  drag.lastX = e.clientX; drag.lastT = e.timeStamp;
  interact();
});
function release(v) {
  const to = Math.round(pos + clamp(v * 220, -2, 2));
  const fi = flavOf(to);
  if (fi !== curFlav) changeFlavour(fi, Math.sign(to - target) || 1);
  goTo(to, { dur: Math.max(380, 650 * Math.min(1, Math.abs(to - pos) + 0.35)), fire: false });
}
arcEl.addEventListener("pointerup", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null;
  body.classList.remove("dragging");
  if (d.started) { release(d.v); return; }
  if (!GL) return;
  const bar = GL.pick(e.clientX, e.clientY);
  if (bar && bar.j != null && bar.j !== Math.round(target)) { interact(); goTo(bar.j); }
});
arcEl.addEventListener("pointercancel", () => {
  if (!drag) return;
  const d = drag; drag = null;
  body.classList.remove("dragging");
  if (d.started && Math.abs(pos - Math.round(pos)) > 0.02) release(0);
});
arcEl.addEventListener("pointerleave", () => arcEl.classList.remove("over"));
playBtn.addEventListener("click", () => next(1));
function setAuto(on) {
  auto = on;
  autoBtn.setAttribute("aria-pressed", String(on));
  interact();
}
autoBtn.setAttribute("aria-pressed", String(auto));
autoBtn.addEventListener("click", () => setAuto(!auto));
addEventListener("keydown", (e) => {
  if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
  if (!entered || heroVis < 0.5) return;
  if (e.key === "ArrowLeft") next(1);
  else if (e.key === "ArrowRight") next(-1);
});

/* =========================================================
   التمرير الناعم (فأرة / لوحة لمس على الكمبيوتر فقط)
   ========================================================= */
let ssTarget = 0, ssActive = false;
const smoothOK = () => FINE.matches && !RM;
addEventListener("wheel", (e) => {
  if (!smoothOK() || e.ctrlKey || body.classList.contains("locked")) return;
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if (e.target.closest && e.target.closest(".cart, textarea, .cards")) return;
  e.preventDefault();
  const mult = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
  if (!ssActive) ssTarget = scrollY;
  ssTarget = clamp(ssTarget + e.deltaY * mult, 0, root.scrollHeight - vh);
  ssActive = true;
}, { passive: false });
function smoothStep(dt) {
  if (!ssActive) return;
  const cur = scrollY;
  const nextY = cur + (ssTarget - cur) * (1 - Math.exp(-dt / 120));
  if (Math.abs(ssTarget - nextY) < 0.5) { scrollTo(0, ssTarget); ssActive = false; }
  else scrollTo(0, nextY);
}
const stopSmooth = () => { ssActive = false; };
addEventListener("keydown", stopSmooth);
addEventListener("pointerdown", stopSmooth);
addEventListener("touchstart", stopSmooth, { passive: true });
function scrollToY(y) {
  y = clamp(y, 0, root.scrollHeight - vh);
  if (smoothOK()) { ssTarget = y; ssActive = true; }
  else scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
}
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  const el = id && document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const off = id === "flavors" || id === "inside" ? 0 : isPhone ? 64 : 80;
  scrollToY(el.getBoundingClientRect().top + scrollY - off);
});

/* =========================================================
   المتجر: الإمالة، الضغط، الإضافة
   ========================================================= */
cards.forEach((card, i) => {
  const st = cardState[i];
  card.addEventListener("pointermove", (e) => {
    if (!FINE.matches || e.pointerType !== "mouse") return;
    const r = card.getBoundingClientRect();
    st.tx = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5);
    st.ty = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5);
    card.classList.add("tilting");
    card.style.transform = "translateY(-8px) rotateX(" + (-st.ty * 12).toFixed(2) + "deg) rotateY(" + (st.tx * 12).toFixed(2) + "deg)" + (card.classList.contains("press") ? " scale(.97)" : "");
    card.style.boxShadow = "0 24px 40px -18px rgba(40,30,20,.35)";
  });
  card.addEventListener("pointerleave", () => {
    st.tx = st.ty = 0;
    card.classList.remove("tilting", "press");
    card.style.transform = "";
    card.style.boxShadow = "";
  });
  card.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".add")) return;
    card.classList.add("press");
    card.style.transform = (card.style.transform || "") + " scale(.97)";
  });
  card.addEventListener("pointerup", () => {
    if (!card.classList.contains("press")) return;
    card.classList.remove("press");
    card.style.transform = card.style.transform.replace(" scale(.97)", "");
  });
  card.addEventListener("click", (e) => {
    if (e.target.closest(".add")) {
      flyToCart([$(".pk", card)], () => addToCart(COOKIES[i].id));
      return;
    }
    if (RM) return;
    if (card.classList.contains("live") && GL) st.poke = performance.now();
    else $(".pk", card).animate([
      { transform: "translateZ(30px) scale(1,1)" },
      { transform: "translateZ(30px) scale(1.06,.93)", offset: 0.3 },
      { transform: "translateZ(30px) scale(.97,1.04)", offset: 0.6 },
      { transform: "translateZ(30px) scale(1,1)" },
    ], { duration: 500, easing: "ease-out" });
  });
});

/* ---------- الطيران إلى السلة ---------- */
function bumpBasket() {
  const b = $("#cart-open");
  b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}
function flyToCart(sources, done) {
  const br = $("#cart-open").getBoundingClientRect();
  const bx = br.left + br.width / 2, by = br.top + br.height / 2;
  if (RM || !sources.length) { done(); bumpBasket(); return; }
  let left = sources.length;
  sources.forEach((src, i) => {
    const r = src.getBoundingClientRect();
    const cl = document.createElement("div");
    cl.className = "fly";
    cl.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
    cl.innerHTML = cookieSVG(COOKIES[Number(src.dataset.f != null ? src.dataset.f : src.closest(".card").dataset.i)].id);
    body.append(cl);
    const dx = bx - (r.left + r.width / 2), dy = by - (r.top + r.height / 2);
    const k = Math.min(0.2, 30 / r.height);
    const lift = Math.min(160, 0.35 * Math.abs(dy) + 60);
    const a = cl.animate([
      { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: "translate(" + dx * 0.4 + "px," + (dy * 0.4 - lift) + "px) scale(" + (0.45 + k) + ") rotate(-10deg)", opacity: 1, offset: 0.45 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + k + ") rotate(-18deg)", opacity: 0.15 },
    ], { duration: 900, delay: i * 120, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" });
    a.onfinish = () => {
      cl.remove();
      bumpBasket();
      if (--left === 0) done();
    };
  });
}

/* =========================================================
   صانع العلبة المشكّلة
   ========================================================= */
const pack = [null, null, null];
let packTouched = false, buyBusy = false;
const slotEls = $$(".slot");
const buyBtn = $("#buy");
function renderPack(newIdx) {
  slotEls.forEach((el, i) => {
    const f = pack[i];
    el.classList.toggle("full", f != null);
    el.classList.toggle("empty", f == null);
    el.innerHTML = (f != null ? '<span class="sp' + (i === newIdx && !RM ? " rise" : "") + '" data-f="' + f + '">' + cookieSVG(COOKIES[f].id) + "</span>" : "") +
      '<button type="button" class="x" ' + (f == null ? 'tabindex="-1" aria-hidden="true"' : 'aria-label="أزل ' + esc(COOKIES[f].name) + ' من العلبة"') + ">" + XSVG + "</button>";
  });
  thumbs.forEach((t, i) => {
    const n = pack.filter((f) => f === i).length;
    const rg = $(".rg", t);
    rg.classList.toggle("on", n > 0);
    rg.textContent = n > 1 ? String(n) : n === 1 ? "✓" : "";
  });
  if (buyBusy) return;
  const missing = pack.filter((f) => f == null).length;
  buyBtn.disabled = missing > 0;
  $(".buy-label", buyBtn).textContent = missing === 0 ? "أضف العلبة إلى السلة" : missing === 3 ? "اختر 3 نكهات" : missing === 2 ? "اختر نكهتين أخريين" : "اختر نكهة أخرى";
}
function setGlow(fi) {
  const g = $("#glow");
  g.style.setProperty("--g", hexToRgba(COOKIES[fi].color, 0.72));
  g.classList.remove("pulse"); void g.offsetWidth; g.classList.add("pulse");
}
function addToPack(fi, silent) {
  const idx = pack.indexOf(null);
  if (idx < 0) { if (!silent) toast("علبتك ممتلئة. أزل نكهة لتضيف غيرها."); return; }
  if (!silent) packTouched = true;
  pack[idx] = fi;
  setGlow(fi);
  renderPack(idx);
}
thumbs.forEach((t, i) => t.addEventListener("click", () => addToPack(i)));
$("#glow").addEventListener("click", (e) => {
  const x = e.target.closest(".slot.full .x");
  if (!x) return;
  packTouched = true;
  pack[Number(x.closest(".slot").dataset.slot)] = null;
  renderPack(-1);
});
buyBtn.addEventListener("click", () => {
  if (pack.includes(null) || buyBusy) return;
  const key = "mix:" + pack.map((f) => COOKIES[f].id).join(",");
  const sources = $$(".slot .sp");
  buyBusy = true;
  flyToCart(sources, () => addToCart(key, true));
  setTimeout(() => {
    pack.fill(null);
    renderPack(-1);
    buyBtn.disabled = false;
    buyBtn.classList.add("done");
    $(".buy-label", buyBtn).textContent = "أُضيفت إلى السلة";
    setTimeout(() => { buyBusy = false; buyBtn.classList.remove("done"); renderPack(-1); }, 1600);
  }, 60);
});
renderPack(-1);
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      if (packTouched || pack.some((f) => f != null)) return;
      [0, 1, 2].forEach((k) => setTimeout(() => { if (!packTouched) addToPack(flavOf(curFlav + k), true); }, 250 + k * 160));
    });
  }, { threshold: 0.3 });
  io.observe(range);
}

/* ---------- ظهور العناوين سطرًا سطرًا ---------- */
if ("IntersectionObserver" in window && !RM) {
  $$(".lines").forEach((h) => {
    if (h.getBoundingClientRect().top < vh) return;
    h.classList.add("armed");
    const io = new IntersectionObserver((ents) => {
      if (ents.some((en) => en.isIntersecting)) { h.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.18 });
    io.observe(h);
  });
}

/* =========================================================
   السلة
   ========================================================= */
const STORAGE_KEY = "homecrumbs-cart-v2";
let cart = {};
try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (err) { cart = {}; }
const byId = (id) => COOKIES.find((c) => c.id === id);
function itemFor(key) {
  if (key.startsWith("mix:")) {
    const ids = key.slice(4).split(",");
    if (ids.length !== 3 || !ids.every(byId)) return null;
    return { key, name: "علبة مشكّلة: " + ids.map((id) => byId(id).name).join("، "), price: SHOP.mixPrice, art: ids[0] };
  }
  const c = byId(key);
  return c ? { key, name: "كوكيز " + c.name, price: c.price, art: c.id } : null;
}
Object.keys(cart).forEach((k) => { if (!itemFor(k) || !(cart[k] > 0)) delete cart[k]; });
function saveCart() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* storage unavailable */ } }
const cartLines = () => Object.keys(cart).map((k) => ({ item: itemFor(k), qty: cart[k] }));
const cartCount = () => cartLines().reduce((n, l) => n + l.qty, 0);
const cartTotal = () => cartLines().reduce((n, l) => n + l.qty * l.item.price, 0);

function addToCart(key, isMix) {
  cart[key] = (cart[key] || 0) + 1;
  saveCart();
  renderCart(true);
  toast(isMix ? "أُضيفت علبتك المشكّلة إلى السلة" : "أُضيفت " + itemFor(key).name + " إلى السلة");
}
function setQty(key, qty) {
  if (qty <= 0) delete cart[key]; else cart[key] = Math.min(qty, 50);
  saveCart();
  renderCart();
}
function renderCart(pop) {
  const n = cartCount();
  const badge = $("#cart-count");
  badge.textContent = n;
  badge.classList.toggle("on", n > 0);
  if (pop && n > 0 && !RM) { badge.classList.remove("pop"); void badge.offsetWidth; badge.classList.add("pop"); }
  const list = $("#cart-items");
  const lines = cartLines();
  list.innerHTML = lines.length ? lines.map((l) =>
    '<li class="cart-item"><span class="thumb-art" aria-hidden="true">' + cookieSVG(l.item.art) + "</span>" +
      '<div><div class="cart-item-name">' + esc(l.item.name) + '</div><div class="cart-item-price">' + money(l.item.price) + " للعلبة</div></div>" +
      '<div class="qty" role="group" aria-label="كمية ' + esc(l.item.name) + '">' +
        '<button type="button" data-dec="' + esc(l.item.key) + '" aria-label="إنقاص علبة">−</button>' +
        "<output>" + l.qty + "</output>" +
        '<button type="button" data-inc="' + esc(l.item.key) + '" aria-label="إضافة علبة">+</button>' +
      "</div></li>").join("")
    : '<li class="cart-empty"><div class="ce" aria-hidden="true">' + cookieSVG("classic") + "</div><p>سلتك فارغة.<br>أضف بعض الكوكيز من المتجر!</p></li>";
  $("#cart-total").textContent = money(cartTotal());
  $("#cart-checkout").setAttribute("aria-disabled", String(!lines.length));
  const box = $("#order-summary");
  box.innerHTML = lines.length
    ? "<h3>طلبك</h3><ul>" + lines.map((l) => "<li><span>" + l.qty + " × " + esc(l.item.name) + "</span><span>" + money(l.qty * l.item.price) + "</span></li>").join("") +
      '<li class="sum-total"><span>المجموع</span><span>' + money(cartTotal()) + "</span></li></ul>"
    : '<p class="empty">سلتك فارغة. <a href="#shop">اختر بعض الكوكيز</a> أولًا.</p>';
}

/* ---------- درج السلة ---------- */
const drawer = $("#cart"), backdrop = $("#cart-backdrop"), openBtn = $("#cart-open");
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("is-open"));
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  openBtn.setAttribute("aria-expanded", "true");
  body.style.overflow = "hidden";
  setTimeout(() => $("#cart-close").focus(), 50);
}
function closeCart(restore) {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("is-open");
  openBtn.setAttribute("aria-expanded", "false");
  body.style.overflow = "";
  setTimeout(() => { backdrop.hidden = true; }, 250);
  if (restore !== false && lastFocus) lastFocus.focus();
}
openBtn.addEventListener("click", openCart);
$("#cart-close").addEventListener("click", () => closeCart());
backdrop.addEventListener("click", () => closeCart());
$("#cart-checkout").addEventListener("click", () => { closeCart(false); setTimeout(() => $("#name").focus({ preventScroll: true }), 500); });
$("#cart-items").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc) setQty(inc.dataset.inc, (cart[inc.dataset.inc] || 0) + 1);
  if (dec) { const k = dec.dataset.dec; setQty(k, (cart[k] || 0) - 1); if (!cart[k]) $("#cart-close").focus(); }
});
document.addEventListener("keydown", (e) => {
  if (!drawer.classList.contains("is-open")) return;
  if (e.key === "Escape") { closeCart(); return; }
  if (e.key === "Tab") {
    const f = drawer.querySelectorAll('button, a[href]:not([aria-disabled="true"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* =========================================================
   نموذج الطلب
   ========================================================= */
(function setupForm() {
  const form = $("#order-form");
  const dateInput = $("#date");
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = iso(tomorrow);
  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "من فضلك اكتب اسمك."),
    phone: (v) => (v.replace(/\D/g, "").length >= 7 ? "" : "من فضلك أدخل رقم جوال صحيح."),
    date: (v) => (!v ? "من فضلك اختر يومًا لطلبك." : v >= dateInput.min ? "" : "يجب أن يكون الطلب قبل يوم واحد على الأقل."),
  };
  function check(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    $("#" + name + "-error").textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) input.setAttribute("aria-describedby", name + "-error" + (name === "phone" ? " phone-hint" : ""));
    else if (name === "phone") input.setAttribute("aria-describedby", "phone-hint");
    else input.removeAttribute("aria-describedby");
    return !msg;
  }
  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener("blur", function () { if (this.value) check(name); });
    form.elements[name].addEventListener("input", function () { if (this.getAttribute("aria-invalid") === "true") check(name); });
  });
  $("#shop-mail").textContent = SHOP.orderEmail;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = $("#form-status");
    status.className = "form-status";
    const results = Object.keys(rules).map(check);
    const firstBad = Object.keys(rules).find((n, i) => !results[i]);
    if (firstBad) { form.elements[firstBad].focus(); status.textContent = ""; return; }
    if (!cartCount()) { status.textContent = "سلتك فارغة. أضف بعض الكوكيز أولًا."; status.classList.add("bad"); return; }
    const data = new FormData(form);
    const text = [
      "مرحبًا " + SHOP.name + "!", "", "أرغب في طلب:",
      cartLines().map((l) => "- " + l.qty + " × " + l.item.name + " (" + money(l.qty * l.item.price) + ")").join("\n"),
      "المجموع: " + money(cartTotal()), "",
      "الاسم: " + data.get("name"), "الجوال: " + data.get("phone"), "التاريخ: " + data.get("date"), "الطريقة: " + data.get("method"),
      data.get("notes") ? "ملاحظات: " + data.get("notes") : "",
    ].join("\n");
    status.textContent = "طلبك جاهز! انسخه وأرسله لنا على البريد الإلكتروني.";
    status.classList.add("ok");
    const out = $("#order-out");
    out.hidden = false;
    $("#order-text").value = text;
    $("#mail-order").href = "mailto:" + SHOP.orderEmail + "?subject=" + encodeURIComponent("طلب كوكيز من " + data.get("name")) + "&body=" + encodeURIComponent(text);
    out.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" });
  });
  $("#copy-order").addEventListener("click", function () {
    const btn = this, ta = $("#order-text");
    const done = () => { btn.textContent = "تم النسخ"; setTimeout(() => { btn.textContent = "نسخ الطلب"; }, 1600); };
    const fallback = () => { ta.focus(); ta.select(); toast("حدّد النص وانسخه يدويًا"); };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (err) { fallback(); }
  });
})();

/* =========================================================
   المقدّمة والدخول إلى الواجهة
   ========================================================= */
function enterHero() {
  if (entered) return;
  entered = true;
  window.__entered = true;
  intro.classList.add("gone");
  setTimeout(() => intro.remove(), 400);
  body.classList.remove("locked");
  nav.classList.add("in");
  const now = performance.now();
  lastInteract = now;
  const fadeIn = (el, delay) => {
    el.style.opacity = "1";
    if (!RM) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay, fill: "backwards" });
  };
  fadeIn(playBtn, 500); fadeIn(countEl, 620); fadeIn(autoBtn, 740);
  $(".rings").style.opacity = "1";
  if (RM) {
    pos = target;
    bitEls.forEach((el) => { el.style.opacity = "0.55"; });
    return;
  }
  $(".rings").animate([{ opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1 }], { duration: 1100, easing: "ease-out" });
  posTween = { from: -2.6, to: target, t0: now, dur: 1700, ease: ENTRY, fire: false, fired: true, dir: 1 };
  bitEls.forEach((el, i) => {
    el.style.opacity = "0.6";
    el.animate([{ opacity: 0 }, { opacity: 0.6 }], { duration: 900, delay: 300 + 90 * i, fill: "backwards" });
    const sx = (i % 2 ? -1 : 1) * (12 + (i % 3));
    el.animate([
      { transform: "translate(0,0) rotate(0deg)" },
      { transform: "translate(" + sx + "px," + -(22 + 3 * i) + "px) rotate(" + (i % 2 ? -10 : 12) + "deg)" },
      { transform: "translate(0,0) rotate(0deg)" },
    ], { duration: 7000 + 900 * i, iterations: Infinity, easing: "ease-in-out", composite: "add" });
  });
}
$("#skip").addEventListener("click", enterHero);

/* =========================================================
   المقاسات والتشغيل
   ========================================================= */
function onResize() {
  vw = innerWidth; vh = innerHeight; isPhone = vw < 820;
  const k = isPhone ? Math.min(vw / 390, vh / 780) : Math.min(vw / 1440, vh / 900);
  root.style.setProperty("--k", k.toFixed(4));
  sizeTitle(COOKIES[curFlav].name);
  placeHL();
  if (GL) GL.resize();
}
addEventListener("resize", onResize);

// الحالة الأولى: رقائق الشوكولاتة
root.style.setProperty("--flav", COOKIES[0].color);
titleEl.append(titleLine(COOKIES[0].name));
countEl.textContent = "01";
paintPieces();
renderCart();
onResize();
document.fonts.ready.then(() => { sizeTitle(COOKIES[curFlav].name); placeHL(); });
requestAnimationFrame(frame);
initGL();

if (RM) enterHero();
else setTimeout(enterHero, 1300);
