/* Blend and Brew — the menu, and the hand-drawn cups that illustrate it.
   Everything visual about a drink (cup, cream, fruit) is drawn from this data,
   so adding a flavour is one line in DRINKS plus one <li> in index.html. */
(function () {
  "use strict";

  const INK = "#161211";

  // body = cup height in SVG units; the 500 ml cup is drawn taller, to scale.
  const CATS = {
    shake:  { label: "Milkshake",           price: 35, ml: 350, body: 150 },
    frappe: { label: "Vegan Coffee Frappe", price: 45, ml: 350, body: 150 },
    slush:  { label: "Slushie",             price: 50, ml: 500, body: 190 },
  };

  // liquid → deep: the drink from top to bottom of the cup.
  // sauce: the drizzle down the inside of a shake cup.
  const DRINKS = [
    { id: "shake-chocolate",  cat: "shake",  name: "Chocolate",     icon: "choc",       liquid: "#8F5A3B", deep: "#5E3522", sauce: "#3A1F14" },
    { id: "shake-strawberry", cat: "shake",  name: "Strawberry",    icon: "strawberry", liquid: "#F8BFCB", deep: "#EE93A8", sauce: "#D4213D" },
    { id: "shake-banana",     cat: "shake",  name: "Banana",        icon: "banana",     liquid: "#FBECB8", deep: "#F2D67E", sauce: "#EDB415" },
    { id: "shake-lime",       cat: "shake",  name: "Lime",          icon: "lime",       liquid: "#DDECB2", deep: "#BFD884", sauce: "#76A72A" },
    { id: "slush-litchi",     cat: "slush",  name: "Litchi",        icon: "litchi",     liquid: "#FCEFF0", deep: "#EDCDD1" },
    { id: "slush-kiwi",       cat: "slush",  name: "Kiwi",          icon: "kiwi",       liquid: "#A8D24F", deep: "#76A62C", seeds: true },
    { id: "slush-strawberry", cat: "slush",  name: "Strawberry",    icon: "strawberry", liquid: "#F25865", deep: "#C92F3D" },
    { id: "slush-mango",      cat: "slush",  name: "Mango",         icon: "mango",      liquid: "#FFB63F", deep: "#F28A12" },
    { id: "slush-passion",    cat: "slush",  name: "Passion Fruit", icon: "passion",    liquid: "#FAD24C", deep: "#E8AB16", seeds: true },
    { id: "frappe-vegan",     cat: "frappe", name: "Vegan Coffee",  icon: "bean",       liquid: "#C0936B", deep: "#93653F", cream: "#EEDCC4" },
  ];

  const byId = (id) => DRINKS.find((d) => d.id === id);
  const fullName = (d) => (d.cat === "frappe" ? CATS.frappe.label : `${d.name} ${CATS[d.cat].label}`);

  // Deterministic scatter, so a drink looks the same every time it is drawn.
  function rng(seed) {
    let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7) || 1;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  const f = (n) => +n.toFixed(1);

  /* ---------- shared defs + fruit icons (inserted once per page) ---------- */

  function ring(n, r, make) {
    let out = "";
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      out += make(16 + Math.cos(a) * r, 16 + Math.sin(a) * r, (a * 180) / Math.PI);
    }
    return out;
  }

  function sprite() {
    const st = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`;
    const limeWedges = ring(8, 0, (x, y, deg) =>
      `<path d="M16 16m1.6 0L25.2 13.4A9.6 9.6 0 0 1 25.2 18.6Z" transform="rotate(${deg} 16 16)" fill="#BEDD63"/>`);
    const kiwiSeeds = ring(12, 6.4, (x, y, deg) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.3" ry=".7" transform="rotate(${f(deg)} ${f(x)} ${f(y)})" fill="${INK}"/>`);
    const passionSeeds = ring(9, 5.2, (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="1.25" fill="#2B1A12"/>`);
    const litchiBumps = ring(10, 8.4, (x, y) => `<circle cx="${f(x - 2)}" cy="${f(y + 1)}" r="1" fill="#A8233A"/>`);

    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
  <filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/>
    <feDisplacementMap in="SourceGraphic" scale="1.7"/>
  </filter>
  <linearGradient id="cyl" x1="0" x2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".16"/>
    <stop offset=".28" stop-color="#fff" stop-opacity=".16"/>
    <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".2"/>
  </linearGradient>
  <pattern id="ice" width="29" height="27" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="4" r="1.9" fill="#fff" fill-opacity=".55"/>
    <circle cx="14" cy="9" r="1.2" fill="#fff" fill-opacity=".4"/>
    <circle cx="24" cy="3" r="1.5" fill="#fff" fill-opacity=".45"/>
    <circle cx="9" cy="19" r="1.6" fill="#fff" fill-opacity=".5"/>
    <circle cx="21" cy="17" r="2.1" fill="#fff" fill-opacity=".35"/>
    <circle cx="27" cy="24" r="1" fill="#fff" fill-opacity=".5"/>
    <circle cx="17" cy="24" r="1.1" fill="#000" fill-opacity=".09"/>
    <circle cx="6" cy="11" r=".9" fill="#000" fill-opacity=".1"/>
    <circle cx="26" cy="11" r="1.2" fill="#000" fill-opacity=".08"/>
  </pattern>
  <pattern id="seeds" width="34" height="31" patternUnits="userSpaceOnUse">
    <g fill="#1d1410">
      <ellipse cx="4" cy="5" rx="1.8" ry="1.1" transform="rotate(25 4 5)"/>
      <ellipse cx="19" cy="9" rx="1.6" ry="1" transform="rotate(-40 19 9)"/>
      <ellipse cx="29" cy="20" rx="1.8" ry="1.1" transform="rotate(70 29 20)"/>
      <ellipse cx="11" cy="22" rx="1.5" ry="1" transform="rotate(-10 11 22)"/>
      <ellipse cx="22" cy="28" rx="1.7" ry="1.1" transform="rotate(35 22 28)"/>
    </g>
  </pattern>
</defs>
<symbol id="i-choc" viewBox="0 0 32 32"><g transform="rotate(-14 16 16)" ${st}>
  <rect x="6" y="7" width="20" height="18" rx="2.2" fill="#5A3221"/>
  <path d="M12.7 7v18M19.3 7v18M6 16h20" fill="none" stroke="#2E170D" stroke-width="1.3"/>
  <path d="M8.2 9.4h2.6M14.8 9.4h2.6M21.4 9.4h2.6" stroke="#9A6A4C" stroke-width="1.2" stroke-linecap="round"/></g></symbol>
<symbol id="i-strawberry" viewBox="0 0 32 32">
  <path d="M16 29.6C8.4 26.2 4.4 18.2 6.1 12.9 7.5 8.9 12 9.6 16 10.6c4-1 8.5-1.7 9.9 2.3 1.7 5.3-2.3 13.3-9.9 16.7z" fill="#E5333F" ${st}/>
  <path d="M9 13.2c1.6-.4 2.2 1.6 1 3.2" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>
  <g fill="#FFE59A"><ellipse cx="11.5" cy="16" rx=".8" ry="1.2"/><ellipse cx="16" cy="15" rx=".8" ry="1.2"/><ellipse cx="20.6" cy="16" rx=".8" ry="1.2"/><ellipse cx="13.6" cy="20.4" rx=".8" ry="1.2"/><ellipse cx="18.4" cy="20.4" rx=".8" ry="1.2"/><ellipse cx="16" cy="25" rx=".8" ry="1.2"/><ellipse cx="10.6" cy="21.4" rx=".8" ry="1.2"/><ellipse cx="21.4" cy="21.4" rx=".8" ry="1.2"/></g>
  <path d="M8.8 11.6Q11.6 6.8 16 9.6 20.4 6.8 23.2 11.6 19.4 13.4 16 11.8 12.6 13.4 8.8 11.6Z" fill="#3E8E2E" ${st}/>
  <path d="M16 9.6V4.6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></symbol>
<symbol id="i-banana" viewBox="0 0 32 32">
  <path d="M4.6 17.4c4.6 7.8 17.2 9 23.2-3.6l-.4-3.1c-.9-.3-1.7 0-2.1.8-4.4 8-13 8.6-18.5 3.3z" fill="#F7D23C" ${st}/>
  <path d="M7.6 19.2c5 4 13.2 4 17.6-3.2" fill="none" stroke="#DDAE16" stroke-width="1.4"/>
  <path d="M27.3 10.8l1.5-3.6" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="4.4" cy="17.3" r="1.2" fill="${INK}"/></symbol>
<symbol id="i-lime" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12.6" fill="#5F9A2A" ${st}/>
  <circle cx="16" cy="16" r="10.4" fill="#F2F8D6"/>${limeWedges}
  <circle cx="16" cy="16" r="1.4" fill="#F2F8D6"/></symbol>
<symbol id="i-litchi" viewBox="0 0 32 32">
  <circle cx="14" cy="17.2" r="11.2" fill="#D7354D" ${st}/>${litchiBumps}
  <circle cx="19" cy="14" r="7.4" fill="#FBF6F0" ${st}/>
  <ellipse cx="17.2" cy="11.8" rx="2.4" ry="1.5" fill="#fff"/></symbol>
<symbol id="i-kiwi" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12.6" fill="#7A5531" ${st}/>
  <circle cx="16" cy="16" r="11" fill="#92C847"/>
  <circle cx="16" cy="16" r="8.4" fill="#A9D75E"/>${kiwiSeeds}
  <circle cx="16" cy="16" r="3.8" fill="#F4F6D8"/></symbol>
<symbol id="i-mango" viewBox="0 0 32 32">
  <path d="M15 6.2c8 0 13.6 6 12.6 13.5C26.6 26.2 20 29.6 13.5 28 7 26.6 3.6 20.6 5 14.6 6.2 9.4 10 6.2 15 6.2z" fill="#FFA51F" ${st}/>
  <ellipse cx="21" cy="13.5" rx="5" ry="4" fill="#F2602B" fill-opacity=".45"/>
  <path d="M9 14c.6-2.6 2.4-4.4 4.6-5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M15.4 6.6C17 2.6 22 1.6 25.2 3.1c-2 3-6.2 4.4-9.8 3.5z" fill="#3E8E2E" ${st}/></symbol>
<symbol id="i-passion" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12.6" fill="#5B2A63" ${st}/>
  <circle cx="16" cy="16" r="10" fill="#F4C232"/>
  <circle cx="16" cy="16" r="7.6" fill="#F8D561"/>${passionSeeds}
  <circle cx="16" cy="16" r="1.25" fill="#2B1A12"/></symbol>
<symbol id="i-bean" viewBox="0 0 32 32"><g transform="rotate(-32 16 16)">
  <ellipse cx="16" cy="16" rx="8.6" ry="12.2" fill="#4A2C1D" ${st}/>
  <path d="M16 4.4c-3.2 4 3.2 7.8 0 11.6s3.2 7.8 0 11.6" fill="none" stroke="#1E100A" stroke-width="2"/>
  <path d="M10.6 11c.6-2.2 1.6-3.6 3-4.4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.3" stroke-linecap="round"/></g></symbol>
</svg>`;
  }

  /* ------------------------------ the cup ------------------------------ */

  let uid = 0;

  // The surface of the drink: a wave wide enough to slide sideways (slosh)
  // without ever showing an edge.
  function wave(top, bottom) {
    let d = `M-160 ${top} q10 -3.2 20 0`;
    for (let i = 0; i < 23; i++) d += " t20 0";
    return `${d} V${bottom} H-160 Z`;
  }

  function cream(d, id, L) {
    const c = d.cream || "#FFF9F1";
    const tier = (cx, cy, rx, ry) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}-cr)" stroke="${L}" stroke-width="2.3"/>`;
    const r = rng(d.id);
    let top = "";

    if (d.icon === "choc") {
      for (let i = 0; i < 14; i++) {
        const x = 46 + r() * 68, y = 56 + r() * 40, a = r() * 180;
        top += `<rect x="${f(x)}" y="${f(y)}" width="5" height="2.4" rx="1" fill="#3A1F14" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`;
      }
      top += `<path d="M50 80q5 6 10 0t10 0 10 0 10 0 10 0 10 0" fill="none" stroke="${d.sauce}" stroke-width="3.4" stroke-linecap="round"/>`;
    } else if (d.icon === "strawberry") {
      top += `<path d="M40 93q6-12 12-2t12-2 12-2 12-2 12-2 12 0 10-4M56 76q6-10 12-1t12-1 12-1 10 0" fill="none" stroke="${d.sauce}" stroke-width="3.6" stroke-linecap="round"/>`;
      for (let i = 0; i < 8; i++) top += `<circle cx="${f(50 + r() * 60)}" cy="${f(62 + r() * 30)}" r="1.6" fill="${d.sauce}"/>`;
    } else if (d.icon === "banana") {
      top += `<path d="M44 92q6-10 12-1t12-1 12-1 12-1 12-1 10-3" fill="none" stroke="${d.sauce}" stroke-width="3.4" stroke-linecap="round"/>`;
      for (const [x, y] of [[68, 56], [91, 61]]) {
        top += `<g transform="rotate(-18 ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="9" ry="6.5" fill="#FCEBB2" stroke="${INK}" stroke-width="1.9"/>
          <ellipse cx="${x}" cy="${y}" rx="4.4" ry="3" fill="#F3D97E"/><circle cx="${x - 1.5}" cy="${y}" r=".8" fill="#9C7A2A"/><circle cx="${x + 1.5}" cy="${y - .6}" r=".8" fill="#9C7A2A"/></g>`;
      }
    } else if (d.icon === "lime") {
      for (let i = 0; i < 18; i++) {
        const x = 46 + r() * 68, y = 62 + r() * 32;
        top += `<rect x="${f(x)}" y="${f(y)}" width="3.2" height="1.4" rx=".7" fill="#5F9A2A" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`;
      }
      top += `<use href="#i-lime" x="67" y="34" width="26" height="26" transform="rotate(-12 80 47)"/>`;
    } else if (d.icon === "bean") {
      for (let i = 0; i < 26; i++) top += `<circle cx="${f(44 + r() * 72)}" cy="${f(60 + r() * 36)}" r="${f(.7 + r() * .7)}" fill="#6B4129"/>`;
      for (const [x, y, s] of [[50, 74, 14], [73, 50, 15], [95, 70, 13], [64, 86, 12], [106, 86, 12]]) {
        top += `<use href="#i-bean" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
      }
    }

    return `<defs><linearGradient id="${id}-cr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.1)}"/>
      </linearGradient></defs>
      ${tier(80, 94, 57, 13)}${tier(80, 80, 47, 13)}${tier(80, 66, 35, 12)}
      <path d="M60 63C60 54 72 50 82 50 79 54 87 57 98 60 101 63 99 66 96 66Z" fill="url(#${id}-cr)" stroke="${L}" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M42 99q16 5 34 2M52 85q14 4 28 1M64 71q10 3 18 0" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="1.6" stroke-linecap="round"/>
      ${top}`;
  }

  function slushMound(d, id, L) {
    const m = "M26 104C20 92 30 84 40 86 38 74 52 68 60 72 62 60 78 56 84 62 92 54 106 60 104 70 116 66 126 76 120 84 132 84 140 96 134 104Z";
    return `<path d="${m}" fill="url(#${id}-g)" stroke="${L}" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="${m}" fill="url(#ice)"/>
      ${d.seeds ? `<path d="${m}" fill="url(#seeds)"/>` : ""}
      <path d="M46 84q6-6 12-4M70 66q6-4 12-1M98 72q6-3 10 1" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
    return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(ch).map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  /** The full cup as an SVG string. `night` draws it for a black background. */
  function renderCup(d, { night = false } = {}) {
    const L = night ? "#EDE3D6" : INK;
    const c = CATS[d.cat];
    const id = `cup${++uid}`;
    const T = 104, H = c.body, B = T + H, VH = B + 14;
    const body = `M24 ${T}H136L121.4 ${B - 8}Q120.6 ${B} 112.6 ${B}H47.4Q39.4 ${B} 38.6 ${B - 8}Z`;
    const r = rng(d.id + "drops");
    const isSlush = d.cat === "slush";

    const drizzle = d.sauce
      ? `<g fill="none" stroke="${d.sauce}" stroke-width="5" stroke-linecap="round" opacity=".92">
          <path d="M31 ${T + 2}q8 16 2 30q-6 16 5 34"/><path d="M58 ${T + 2}q-6 20 4 38q8 20-2 44"/>
          <path d="M96 ${T + 2}q8 18-2 36q-8 16 4 30q6 14 0 28"/><path d="M126 ${T + 2}q-7 14 0 30"/></g>`
      : "";

    let drops = "";
    if (isSlush || d.cat === "frappe") {
      for (let i = 0; i < 16; i++) {
        const y = T + 14 + r() * (H - 30), x = 46 + r() * 70;
        drops += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1.2 + r() * 1.2)}" ry="${f(1.8 + r() * 1.4)}"/>`;
      }
      drops = `<g fill="#fff" opacity=".55">${drops}</g>`;
    }

    const top = isSlush ? slushMound(d, id, L) : cream(d, id, L);

    return `<svg viewBox="0 0 160 ${VH}" width="160" height="${VH}" role="img" aria-label="${fullName(d)}" style="--vh:${VH}">
  <defs>
    <clipPath id="${id}-clip"><path d="${body}"/></clipPath>
    <linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d.liquid}"/><stop offset="1" stop-color="${d.deep}"/></linearGradient>
  </defs>
  <ellipse class="shadow" cx="80" cy="${B + 5}" rx="50" ry="5.5" fill="${INK}" opacity=".16"/>
  <g clip-path="url(#${id}-clip)">
    <rect x="0" y="${T}" width="160" height="${H}" fill="#fff" fill-opacity=".45"/>
    <g class="liquid" style="--drop:${H + 10}px">
      <g class="wave">
        <path d="${wave(T + 3, B + 12)}" fill="url(#${id}-g)"/>
        ${isSlush ? `<path d="${wave(T + 3, B + 12)}" fill="url(#ice)"/>` : ""}
        ${d.seeds ? `<path d="${wave(T + 3, B + 12)}" fill="url(#seeds)"/>` : ""}
      </g>
    </g>
    ${drizzle}
    <rect x="24" y="${T}" width="112" height="${H}" fill="url(#cyl)"/>
    <path d="M36 ${T + 10}L46 ${T + 10}L53 ${B - 16}L46 ${B - 16}Z" fill="#fff" opacity=".38"/>
    <path d="M118 ${T + 12}L122 ${T + 12}L113.5 ${B - 24}L110.5 ${B - 24}Z" fill="#fff" opacity=".28"/>
    ${drops}
  </g>
  ${night ? `<path d="M100 74L111 3" stroke="${L}" stroke-width="12"/>` : ""}
  <path d="M100 74L111 3" stroke="${INK}" stroke-width="8.5"/>
  <path d="M98.4 70L108.6 3.4" stroke="#fff" stroke-opacity=".28" stroke-width="1.4"/>
  <g class="top" filter="url(#wob)">${top}</g>
  <g filter="url(#wob)">
    <path d="M20 98A60 52 0 0 1 140 98" fill="#fff" fill-opacity=".16" stroke="${L}" stroke-width="2.4"/>
    <path d="M33 84A47 40 0 0 1 58 57" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    <rect x="16" y="95" width="128" height="10" rx="5" fill="#fff" fill-opacity=".6" stroke="${L}" stroke-width="2.4"/>
    <path d="${body}" fill="none" stroke="${L}" stroke-width="2.7" stroke-linejoin="round"/>
    <path d="M26.5 ${T + 13}H133.5" stroke="${INK}" stroke-opacity=".28" stroke-width="1.4"/>
  </g>
  <g class="garnish">
    <use href="#i-${d.icon}" x="96" y="${B - 34}" width="46" height="46"/>
    <use href="#i-${d.icon}" x="18" y="${B - 22}" width="30" height="30" transform="rotate(-20 33 ${B - 7})"/>
  </g>
</svg>`;
  }

  window.BNB = { CATS, DRINKS, byId, fullName, renderCup, sprite };
})();
