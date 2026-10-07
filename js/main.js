/* Blend and Brew — page behaviour: pouring cups, the hero menu board,
   the order slip, and the shop details from config.js. */
(function () {
  "use strict";

  const { CATS, DRINKS, byId, fullName, renderCup, sprite } = window.BNB;
  const cfg = window.BNB_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (n) => `R${n}`;

  document.body.insertAdjacentHTML("afterbegin", sprite());

  /* ---------------- cups ---------------- */

  // Draw the cup empty and flush styles before filling, so the liquid
  // visibly rises instead of appearing full.
  function pour(el, d) {
    el.classList.remove("is-full", "is-pouring");
    el.innerHTML = renderCup(d, { night: !!el.closest(".band") });
    if (reduceMotion) return el.classList.add("is-full");
    void el.getBoundingClientRect();
    el.classList.add("is-full", "is-pouring");
    clearTimeout(el._slosh);
    el._slosh = setTimeout(() => el.classList.remove("is-pouring"), 2200);
  }

  // Drain what's there (if anything), then pour the next one.
  function repour(el, d) {
    if (!el.classList.contains("is-full") || reduceMotion) return pour(el, d);
    el.classList.remove("is-full");
    clearTimeout(el._next);
    el._next = setTimeout(() => pour(el, d), 480);
  }

  const shelfCups = $$("[data-drink] [data-cup]").map((el) => {
    const d = byId(el.closest("[data-drink]").dataset.drink);
    el.innerHTML = renderCup(d, { night: !!el.closest(".band") });
    el.addEventListener("click", () => repour(el, d));
    return el;
  });

  // Cups fill as they scroll into view, left to right along each shelf.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        const siblings = $$("[data-cup]", e.target.closest("ul, .frappe-stage"));
        const i = Math.max(0, siblings.indexOf(e.target));
        setTimeout(() => pour(e.target, byId(e.target.closest("[data-drink]").dataset.drink)), i * 180);
        io.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    shelfCups.forEach((el) => io.observe(el));
  } else {
    shelfCups.forEach((el) => el.classList.add("is-full"));
  }

  /* ---------------- hero: the menu board ---------------- */

  const heroCup = $("[data-hero-cup]");
  const plate = $("[data-plate]");
  const picker = $("[data-picker]");
  const heroAdd = $("[data-hero-add]");
  const tour = ["shake-strawberry", "slush-mango", "frappe-vegan", "shake-chocolate", "slush-passion",
                "shake-banana", "slush-kiwi", "shake-lime", "slush-litchi", "slush-strawberry"];
  let current = null;
  let autoplay = !reduceMotion;
  let timer = null;

  DRINKS.forEach((d) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.show = d.id;
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", fullName(d));
    b.title = fullName(d);
    b.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-${d.icon}"/></svg>`;
    picker.appendChild(b);
  });

  function show(id) {
    if (id === current) return;
    const d = byId(id);
    const c = CATS[d.cat];
    current = id;
    repour(heroCup, d);
    plate.style.setProperty("--flavour", d.liquid === "#FCEFF0" ? "#F4C6CF" : d.liquid);
    $("[data-hero-name]").textContent = fullName(d);
    $("[data-hero-meta]").textContent = `${rand(c.price)} · ${c.ml} ml`;
    heroAdd.dataset.add = id;
    $$("button", picker).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.show === id)));
    $$(".board a").forEach((a) => a.classList.toggle("is-on", a.dataset.cat === d.cat));
  }

  function stopAutoplay() {
    autoplay = false;
    clearInterval(timer);
  }

  function startAutoplay() {
    clearInterval(timer);
    if (!autoplay) return;
    timer = setInterval(() => {
      if (document.hidden) return;
      show(tour[(tour.indexOf(current) + 1) % tour.length]);
    }, 4200);
  }

  picker.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-show]");
    if (!b) return;
    stopAutoplay();
    show(b.dataset.show);
  });

  // Pointing at a row on the board pours that kind of drink.
  $$(".board a").forEach((a) => {
    const preview = () => {
      if (current && byId(current).cat === a.dataset.cat) return;
      stopAutoplay();
      show(DRINKS.find((d) => d.cat === a.dataset.cat).id);
    };
    a.addEventListener("mouseenter", preview);
    a.addEventListener("focus", preview);
  });

  heroCup.addEventListener("click", () => {
    stopAutoplay();
    const d = byId(current);
    current = null;
    show(d.id);
  });

  $("[data-pick-me]").addEventListener("click", () => {
    stopAutoplay();
    const options = DRINKS.filter((d) => d.id !== current);
    const pick = options[Math.floor(Math.random() * options.length)];
    if (reduceMotion) return show(pick.id);
    plate.classList.remove("is-spinning");
    void plate.offsetWidth;
    plate.classList.add("is-spinning");
    setTimeout(() => show(pick.id), 450);
    setTimeout(() => plate.classList.remove("is-spinning"), 950);
  });

  // Only cycle while the hero is actually on screen.
  show(tour[0]);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? startAutoplay() : clearInterval(timer)), { threshold: 0.3 })
      .observe(plate);
  } else {
    startAutoplay();
  }

  /* ---------------- header ---------------- */

  const top = $("[data-top]");
  const onScroll = () => top.classList.toggle("is-stuck", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- the order slip ---------------- */

  const KEY = "blendandbrew-slip-v1";
  const slipEl = $("#slip");
  const scrim = $(".scrim");
  const fab = $(".slip-fab");
  const announce = $("[data-announce]");
  let slip = {};

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    for (const [id, n] of Object.entries(saved)) if (byId(id) && n > 0) slip[id] = Math.min(99, n | 0);
  } catch (_) { /* private mode or blocked storage: start empty */ }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(slip)); } catch (_) {} };
  const lines = () => DRINKS.filter((d) => slip[d.id]).map((d) => ({ d, n: slip[d.id], sum: slip[d.id] * CATS[d.cat].price }));
  const count = () => Object.values(slip).reduce((a, b) => a + b, 0);
  const total = () => lines().reduce((a, l) => a + l.sum, 0);

  function waLink() {
    const text = [
      "Hi Blend and Brew! ♥ Here's our order:",
      ...lines().map((l) => `${l.n} × ${fullName(l.d)} — ${rand(l.sum)}`),
      `Total: ${rand(total())}`,
    ].join("\n");
    const to = String(cfg.whatsapp || "").replace(/\D/g, "");
    return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
  }

  function renderSlip() {
    const ls = lines();
    $("[data-slip-lines]").innerHTML = ls.map((l) => `
      <li class="slip-line">
        <span class="qty">
          <button type="button" data-dec="${l.d.id}" aria-label="One less ${fullName(l.d)}">−</button>
          <output aria-label="Quantity">${l.n}</output>
          <button type="button" data-inc="${l.d.id}" aria-label="One more ${fullName(l.d)}">+</button>
        </span>
        <span class="nm">${fullName(l.d)}</span>
        <span class="amt">${rand(l.sum)}</span>
      </li>`).join("");
    $("[data-slip-empty]").hidden = ls.length > 0;
    $$("[data-slip-count]").forEach((el) => (el.textContent = count()));
    $$("[data-slip-total]").forEach((el) => (el.textContent = rand(total())));
    const wa = $("[data-slip-wa]");
    wa.href = ls.length ? waLink() : "#";
    wa.setAttribute("aria-disabled", String(!ls.length));
    wa.textContent = cfg.whatsapp ? "Send to Blend and Brew" : "Send on WhatsApp";
    fab.hidden = !ls.length || slipEl.classList.contains("is-open");
  }

  function setOpen(open) {
    slipEl.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    slipEl.setAttribute("aria-hidden", String(!open));
    slipEl.inert = !open;
    $$("[data-slip-open]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
    if (open) {
      $("[data-slip-date]").textContent = new Date().toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      $(".slip-close").focus();
    }
    renderSlip();
  }

  function add(id, btn) {
    slip[id] = Math.min(99, (slip[id] || 0) + 1);
    save();
    renderSlip();
    announce.textContent = `Added a ${fullName(byId(id))}. ${count()} on your slip, ${rand(total())}.`;
    $$("[data-slip-count]").forEach((el) => {
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    });
    const card = btn && btn.closest(".drink");
    if (card) {
      card.classList.remove("is-hop");
      void card.offsetWidth;
      card.classList.add("is-hop");
    }
    if (btn) {
      const was = btn.textContent;
      btn.classList.add("is-added");
      btn.textContent = "Added ✓";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = was; btn.classList.remove("is-added"); }, 1100);
    }
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add], [data-inc], [data-dec], [data-slip-open], [data-slip-close], [data-slip-clear]");
    if (!t) return;
    if (t.dataset.add) return add(t.dataset.add, t);
    if (t.dataset.inc) { slip[t.dataset.inc] = Math.min(99, slip[t.dataset.inc] + 1); save(); return renderSlip(); }
    if (t.dataset.dec) {
      if (--slip[t.dataset.dec] <= 0) delete slip[t.dataset.dec];
      save();
      renderSlip();
      if (!count()) $(".slip-close").focus();
      return;
    }
    if (t.hasAttribute("data-slip-open")) return setOpen(!slipEl.classList.contains("is-open"));
    if (t.hasAttribute("data-slip-close")) { setOpen(false); return $(".slip-btn").focus(); }
    if (t.hasAttribute("data-slip-clear")) { slip = {}; save(); renderSlip(); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && slipEl.classList.contains("is-open")) {
      setOpen(false);
      $(".slip-btn").focus();
    }
  });

  renderSlip();

  /* ---------------- shop details (config.js) ---------------- */

  const visit = $("[data-visit]");
  if (cfg.address) Object.assign($("[data-address]", visit), { textContent: cfg.address, hidden: false });
  if (cfg.mapUrl) Object.assign($("[data-map]", visit), { href: cfg.mapUrl, hidden: false });
  if (Array.isArray(cfg.hours) && cfg.hours.length) {
    const dl = $("[data-hours]", visit);
    cfg.hours.forEach(([days, time]) => dl.insertAdjacentHTML("beforeend", "<dt></dt><dd></dd>"));
    $$("dt", dl).forEach((dt, i) => (dt.textContent = cfg.hours[i][0]));
    $$("dd", dl).forEach((dd, i) => (dd.textContent = cfg.hours[i][1]));
    dl.hidden = false;
  }
  visit.hidden = !(cfg.address || cfg.mapUrl || (cfg.hours && cfg.hours.length));

  const socials = [
    cfg.instagram && ["Instagram", `https://instagram.com/${cfg.instagram.replace(/^@/, "")}`, `@${cfg.instagram.replace(/^@/, "")}`],
    cfg.facebook && ["Facebook", cfg.facebook, "Facebook"],
    cfg.tiktok && ["TikTok", `https://www.tiktok.com/@${cfg.tiktok.replace(/^@/, "")}`, `TikTok @${cfg.tiktok.replace(/^@/, "")}`],
    cfg.whatsapp && ["WhatsApp", `https://wa.me/${String(cfg.whatsapp).replace(/\D/g, "")}`, "WhatsApp us"],
  ].filter(Boolean);
  if (socials.length) {
    const ul = $("[data-social-list]");
    socials.forEach(([name, href, text]) => {
      const a = Object.assign(document.createElement("a"), { href, textContent: text, target: "_blank", rel: "noopener" });
      a.setAttribute("aria-label", `Blend and Brew on ${name}`);
      ul.appendChild(document.createElement("li")).appendChild(a);
    });
    $("[data-social]").hidden = false;
  }

  $("[data-year]").textContent = new Date().getFullYear();
})();
