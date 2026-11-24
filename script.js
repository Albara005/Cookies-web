/* =========================================================
   Home Crumbs — site behaviour
   - Hand-drawn SVG cookie illustrations (no image files needed)
   - Menu rendering + filters
   - Cookie box (cart) saved in the browser
   - Order form with validation that opens a pre-filled email
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Settings: edit these for your shop ---------- */
  const SHOP = {
    name: "Home Crumbs",
    orderEmail: "orders@homecrumbs.example", // <- put your real email here
    currency: "USD",
  };

  /* ---------- The cookies (edit names, prices, descriptions) ---------- */
  const COOKIES = [
    { id: "classic",   name: "Classic Chocolate Chip", price: 15, category: "classic",   badge: "Bestseller", tint: "#fde3b0",
      desc: "Brown butter dough, crispy edges, soft gooey centre and big pools of dark chocolate." },
    { id: "double",    name: "Double Chocolate Fudge", price: 17, category: "chocolate", tint: "#f3d3b5",
      desc: "Rich cocoa dough loaded with chocolate chunks and a pinch of flaky sea salt." },
    { id: "oat",       name: "Oatmeal Raisin",         price: 14, category: "classic",   tint: "#f6e6c2",
      desc: "Chewy rolled oats, plump raisins and a warm hint of cinnamon. Grandma's favourite." },
    { id: "pb",        name: "Peanut Butter Crunch",   price: 15, category: "classic",   tint: "#fbe2b8",
      desc: "Creamy peanut butter cookie with the classic fork criss-cross and crunchy peanut bits." },
    { id: "redvelvet", name: "Red Velvet White Chip",  price: 17, category: "special",   badge: "New", tint: "#f9d6cf",
      desc: "Soft red velvet cookie studded with creamy white chocolate chips." },
    { id: "sugar",     name: "Funfetti Sugar Cookie",  price: 14, category: "special",   tint: "#fcecc9",
      desc: "Buttery vanilla sugar cookie rolled in rainbow sprinkles. A birthday in every bite." },
    { id: "smores",    name: "S'mores Stuffed",        price: 18, category: "chocolate", badge: "Weekend only", tint: "#f2dcc0",
      desc: "Graham cracker cookie stuffed with toasted marshmallow and milk chocolate." },
    { id: "pistachio", name: "Pistachio Cardamom",     price: 18, category: "special",   badge: "Seasonal", tint: "#e6ecc8",
      desc: "Roasted pistachios, a touch of cardamom and a white chocolate drizzle." },
  ];

  /* ---------- Cookie illustration styles ---------- */
  const STYLES = {
    classic:   { dough: ["#e9b46e", "#b8732f"], chip: "#3d1c0b", chips: 9 },
    double:    { dough: ["#8a4f2c", "#4f2812"], chip: "#2a1207", chips: 8, flecks: "#f3e6d4" },
    oat:       { dough: ["#e8c48a", "#b98a4c"], chip: "#5e2a3a", chips: 7, oats: true },
    pb:        { dough: ["#e9ad62", "#b67533"], chip: "#c98c45", chips: 0, crosshatch: true, nuts: 6 },
    redvelvet: { dough: ["#b3313a", "#7a1a22"], chip: "#fff6ea", chips: 9 },
    sugar:     { dough: ["#f6dca8", "#d8ac6b"], chip: "#000", chips: 0, sprinkles: 26 },
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
  function f(n) { return n.toFixed(1); }

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
      const mx = (p[0] + n[0]) / 2, my = (p[1] + n[1]) / 2;
      if (i === 0) {
        const prev = pts[pts.length - 1];
        d += "M" + f((prev[0] + p[0]) / 2) + " " + f((prev[1] + p[1]) / 2);
      }
      d += " Q" + f(p[0]) + " " + f(p[1]) + " " + f(mx) + " " + f(my);
    }
    return d + "Z";
  }

  function randomPointInCircle(rand, r) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r;
    return [50 + Math.cos(a) * d, 50 + Math.sin(a) * d];
  }

  function cookieSVG(kind) {
    const s = STYLES[kind] || STYLES.classic;
    const rand = rng(hashString(kind));
    const id = "ck" + (++svgUid);
    const outline = blobPath(rand, 50, 50, 43, 4, 16);
    let out = "";

    out += '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" focusable="false">';
    out += "<defs>";
    out += '<radialGradient id="' + id + 'g" cx="42%" cy="38%" r="70%">';
    out += '<stop offset="0%" stop-color="' + s.dough[0] + '"/>';
    out += '<stop offset="70%" stop-color="' + s.dough[0] + '"/>';
    out += '<stop offset="100%" stop-color="' + s.dough[1] + '"/>';
    out += "</radialGradient>";
    out += '<clipPath id="' + id + 'c"><path d="' + outline + '"/></clipPath>';
    out += "</defs>";

    // body + rim
    out += '<path d="' + outline + '" fill="url(#' + id + 'g)" stroke="' + s.dough[1] + '" stroke-width="1.5"/>';
    out += '<g clip-path="url(#' + id + 'c)">';

    // baked cracks / texture
    for (let i = 0; i < 6; i++) {
      const p = randomPointInCircle(rand, 30);
      const a = rand() * Math.PI;
      const len = 6 + rand() * 8;
      const x2 = p[0] + Math.cos(a) * len, y2 = p[1] + Math.sin(a) * len;
      const qx = (p[0] + x2) / 2 + (rand() - 0.5) * 6, qy = (p[1] + y2) / 2 + (rand() - 0.5) * 6;
      out += '<path d="M' + f(p[0]) + " " + f(p[1]) + " Q" + f(qx) + " " + f(qy) + " " + f(x2) + " " + f(y2) +
        '" stroke="' + s.dough[1] + '" stroke-opacity="0.45" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    }
    // highlight
    out += '<ellipse cx="38" cy="34" rx="16" ry="9" fill="#fff" opacity="0.12" transform="rotate(-25 38 34)"/>';

    if (s.flecks) {
      for (let i = 0; i < 14; i++) {
        const p = randomPointInCircle(rand, 36);
        out += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="0.9" fill="' + s.flecks + '" opacity="0.8"/>';
      }
    }
    if (s.oats) {
      for (let i = 0; i < 10; i++) {
        const p = randomPointInCircle(rand, 34);
        out += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="3.6" ry="1.8" fill="#f4dfb4" stroke="#c9a46a" stroke-width="0.5" transform="rotate(' +
          f(rand() * 180) + " " + f(p[0]) + " " + f(p[1]) + ')"/>';
      }
    }
    if (s.crosshatch) {
      for (let i = -3; i <= 3; i++) {
        const o = i * 7;
        out += '<path d="M' + f(20 + o) + ' 20 L' + f(80 + o) + ' 80" stroke="' + s.dough[1] + '" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>';
        out += '<path d="M' + f(80 + o) + ' 20 L' + f(20 + o) + ' 80" stroke="' + s.dough[1] + '" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>';
      }
    }
    if (s.marshmallow) {
      out += '<path d="' + blobPath(rand, 50, 52, 15, 5, 9) + '" fill="#fffaf0" stroke="#e8cfa6" stroke-width="1"/>';
      out += '<path d="' + blobPath(rand, 53, 49, 7, 3, 7) + '" fill="#d9a066" opacity="0.55"/>';
    }

    // chips
    for (let i = 0; i < s.chips; i++) {
      const p = randomPointInCircle(rand, 32);
      if (s.marshmallow && Math.hypot(p[0] - 50, p[1] - 52) < 17) continue;
      const r = 3.2 + rand() * 2.6;
      out += '<path d="' + blobPath(rand, p[0], p[1], r, r * 0.6, 5) + '" fill="' + s.chip + '"/>';
      out += '<circle cx="' + f(p[0] - r * 0.3) + '" cy="' + f(p[1] - r * 0.35) + '" r="' + f(r * 0.25) + '" fill="#fff" opacity="0.18"/>';
    }
    if (s.nuts) {
      for (let i = 0; i < s.nuts; i++) {
        const p = randomPointInCircle(rand, 32);
        const fill = kind === "pistachio" ? (i % 2 ? "#8aa84a" : "#a9c063") : "#c98c45";
        out += '<path d="' + blobPath(rand, p[0], p[1], 2.8, 1.6, 6) + '" fill="' + fill + '" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>';
      }
    }
    if (s.sprinkles) {
      const colors = ["#e23d5b", "#2f8fdd", "#f5b700", "#3ab26a", "#9b5de5", "#ff7a1a"];
      for (let i = 0; i < s.sprinkles; i++) {
        const p = randomPointInCircle(rand, 36);
        const a = rand() * 180;
        out += '<rect x="' + f(p[0] - 2.4) + '" y="' + f(p[1] - 0.8) + '" width="4.8" height="1.6" rx="0.8" fill="' +
          colors[i % colors.length] + '" transform="rotate(' + f(a) + " " + f(p[0]) + " " + f(p[1]) + ')"/>';
      }
    }
    if (s.drizzle) {
      let d = "M8 34";
      for (let i = 0; i < 6; i++) {
        d += " Q" + f(16 + i * 15) + " " + f(18 + rand() * 50) + " " + f(22 + i * 15) + " " + f(30 + rand() * 40);
      }
      out += '<path d="' + d + '" stroke="#fffaf0" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.95"/>';
    }

    out += "</g></svg>";
    return out;
  }

  function hydrateCookieArt(root) {
    (root || document).querySelectorAll("[data-cookie]").forEach(function (el) {
      el.innerHTML = cookieSVG(el.getAttribute("data-cookie"));
      const size = el.getAttribute("data-size");
      if (size && !el.classList.contains("hero-cookie") && !el.classList.contains("recipe-cookie")) {
        el.firstChild.setAttribute("width", size);
        el.firstChild.setAttribute("height", size);
      }
    });
  }

  /* ---------- Helpers ---------- */
  const money = new Intl.NumberFormat(undefined, { style: "currency", currency: SHOP.currency });
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const byId = function (id) { return COOKIES.find(function (c) { return c.id === id; }); };
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-visible"); }, 2400);
  }

  /* ---------- Menu ---------- */
  function renderMenu() {
    const grid = $("#cookie-grid");
    grid.innerHTML = COOKIES.map(function (c) {
      return (
        '<li class="cookie-card reveal" data-category="' + c.category + '">' +
          (c.badge ? '<span class="badge">' + escapeHTML(c.badge) + "</span>" : "") +
          '<div class="cookie-visual" style="--tint:' + c.tint + '" aria-hidden="true">' + cookieSVG(c.id) + "</div>" +
          "<h3>" + escapeHTML(c.name) + "</h3>" +
          "<p>" + escapeHTML(c.desc) + "</p>" +
          '<div class="card-foot">' +
            '<p class="price">' + money.format(c.price) + "<small>box of 6</small></p>" +
            '<button type="button" class="btn btn-primary add-btn" data-add="' + c.id + '" aria-label="Add a box of ' +
              escapeHTML(c.name) + ' to your cookie box">Add</button>' +
          "</div>" +
        "</li>"
      );
    }).join("");

    grid.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      addToCart(btn.getAttribute("data-add"));
      btn.classList.add("added");
      btn.textContent = "Added";
      setTimeout(function () { btn.classList.remove("added"); btn.textContent = "Add"; }, 1200);
    });
  }

  function setupFilters() {
    const chips = document.querySelectorAll("[data-filter]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        const value = chip.getAttribute("data-filter");
        chips.forEach(function (c) {
          const on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", String(on));
        });
        document.querySelectorAll(".cookie-card").forEach(function (card) {
          card.hidden = value !== "all" && card.getAttribute("data-category") !== value;
        });
      });
    });
  }

  /* ---------- Cart ---------- */
  const STORAGE_KEY = "homecrumbs-cart-v1";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (k) { if (!byId(k) || !(cart[k] > 0)) delete cart[k]; });

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }
  function cartLines() {
    return Object.keys(cart).map(function (k) { return { item: byId(k), qty: cart[k] }; });
  }
  function cartCount() { return cartLines().reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartTotal() { return cartLines().reduce(function (n, l) { return n + l.qty * l.item.price; }, 0); }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    const count = $("#cart-count");
    count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump");
    toast("Added " + byId(id).name + " to your box");
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = Math.min(qty, 50);
    saveCart();
    renderCart();
  }

  function renderCart() {
    $("#cart-count").textContent = cartCount();
    const list = $("#cart-items");
    const lines = cartLines();
    if (!lines.length) {
      list.innerHTML =
        '<li class="cart-empty"><div class="cookie-empty" aria-hidden="true">' + cookieSVG("classic") + "</div>" +
        "<p>Your cookie box is empty.<br>Add a few treats from the menu!</p></li>";
    } else {
      list.innerHTML = lines.map(function (l) {
        return (
          '<li class="cart-item">' +
            '<span class="thumb" aria-hidden="true">' + cookieSVG(l.item.id) + "</span>" +
            "<div><div class=\"cart-item-name\">" + escapeHTML(l.item.name) + "</div>" +
            '<div class="cart-item-price">' + money.format(l.item.price) + " per box</div></div>" +
            '<div class="qty" role="group" aria-label="Quantity of ' + escapeHTML(l.item.name) + '">' +
              '<button type="button" data-dec="' + l.item.id + '" aria-label="Remove one box">−</button>' +
              "<output>" + l.qty + "</output>" +
              '<button type="button" data-inc="' + l.item.id + '" aria-label="Add one box">+</button>' +
            "</div>" +
          "</li>"
        );
      }).join("");
    }
    $("#cart-total").textContent = money.format(cartTotal());
    const checkout = $("#cart-checkout");
    checkout.setAttribute("aria-disabled", String(!lines.length));
    renderSummary();
  }

  function renderSummary() {
    const box = $("#order-summary");
    const lines = cartLines();
    if (!lines.length) {
      box.innerHTML = '<p class="empty">Your box is empty. <a href="#menu">Pick some cookies</a> first.</p>';
      return;
    }
    box.innerHTML =
      "<h3>Your box</h3><ul>" +
      lines.map(function (l) {
        return "<li><span>" + l.qty + " × " + escapeHTML(l.item.name) + "</span><span>" + money.format(l.qty * l.item.price) + "</span></li>";
      }).join("") +
      '<li class="sum-total"><span>Total</span><span>' + money.format(cartTotal()) + "</span></li></ul>";
  }

  /* ---------- Cart drawer ---------- */
  const drawer = $("#cart");
  const backdrop = $("#cart-backdrop");
  const openBtn = $("#cart-open");
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(function () { backdrop.classList.add("is-open"); });
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(function () { $("#cart-close").focus(); }, 50);
  }
  function closeCart(restoreFocus) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { backdrop.hidden = true; }, 250);
    if (restoreFocus !== false && lastFocus) lastFocus.focus();
  }

  function setupCart() {
    openBtn.addEventListener("click", openCart);
    $("#cart-close").addEventListener("click", closeCart);
    backdrop.addEventListener("click", closeCart);
    $("#cart-checkout").addEventListener("click", function () { closeCart(false); setTimeout(function () { $("#name").focus({ preventScroll: true }); }, 400); });
    $("#cart-items").addEventListener("click", function (e) {
      const inc = e.target.closest("[data-inc]");
      const dec = e.target.closest("[data-dec]");
      if (inc) setQty(inc.dataset.inc, (cart[inc.dataset.inc] || 0) + 1);
      if (dec) {
        const id = dec.dataset.dec;
        setQty(id, (cart[id] || 0) - 1);
        if (!cart[id]) $("#cart-close").focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeCart(); return; }
      if (e.key === "Tab") {
        const focusables = drawer.querySelectorAll('button, a[href]:not([aria-disabled="true"])');
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Order form ---------- */
  function isoDate(d) {
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }

  function setupForm() {
    const form = $("#order-form");
    const dateInput = $("#date");
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = isoDate(tomorrow);

    const rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please tell us your name."; },
      phone: function (v) { return v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a phone number we can text."; },
      date: function (v) {
        if (!v) return "Please choose a day for your cookies.";
        return v >= dateInput.min ? "" : "Please order at least one day ahead.";
      },
    };

    function check(name) {
      const input = form.elements[name];
      const msg = rules[name](input.value);
      const err = $("#" + name + "-error");
      err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) input.setAttribute("aria-describedby", name + "-error" + (name === "phone" ? " phone-hint" : ""));
      else if (name === "phone") input.setAttribute("aria-describedby", "phone-hint");
      else input.removeAttribute("aria-describedby");
      return !msg;
    }

    Object.keys(rules).forEach(function (name) {
      form.elements[name].addEventListener("blur", function () { if (this.value) check(name); });
      form.elements[name].addEventListener("input", function () {
        if (this.getAttribute("aria-invalid") === "true") check(name);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const status = $("#form-status");
      status.className = "form-status";
      const results = Object.keys(rules).map(check);
      const firstBad = Object.keys(rules).find(function (n, i) { return !results[i]; });
      if (firstBad) { form.elements[firstBad].focus(); status.textContent = ""; return; }
      if (!cartCount()) {
        status.textContent = "Your cookie box is empty. Add some cookies first.";
        status.classList.add("bad");
        return;
      }

      const data = new FormData(form);
      const lines = cartLines().map(function (l) {
        return "- " + l.qty + " x " + l.item.name + " (" + money.format(l.qty * l.item.price) + ")";
      });
      const body = [
        "Hello " + SHOP.name + "!",
        "",
        "I'd like to order:",
        lines.join("\n"),
        "Total: " + money.format(cartTotal()),
        "",
        "Name: " + data.get("name"),
        "Phone: " + data.get("phone"),
        "Date: " + data.get("date"),
        "Method: " + data.get("method"),
        data.get("notes") ? "Notes: " + data.get("notes") : "",
      ].join("\n");

      const href = "mailto:" + SHOP.orderEmail +
        "?subject=" + encodeURIComponent("Cookie order from " + data.get("name")) +
        "&body=" + encodeURIComponent(body);

      status.textContent = "Thank you! Your email app is opening with your order. Just press send.";
      status.classList.add("ok");
      window.location.href = href;
    });
  }

  /* ---------- Header, nav, misc ---------- */
  function setupHeader() {
    const header = $(".site-header");
    const onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toggle = $("#menu-toggle");
    const list = $("#nav-list");
    function setMenu(open) {
      list.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".visually-hidden").textContent = open ? "Close menu" : "Open menu";
    }
    toggle.addEventListener("click", function () { setMenu(!list.classList.contains("is-open")); });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
  }

  function renderStars() {
    const star = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
    document.querySelectorAll(".stars").forEach(function (el) { el.innerHTML = star.repeat(5); });
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal, .step, .review, .section-head");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Start ---------- */
  hydrateCookieArt();
  renderMenu();
  setupFilters();
  renderCart();
  setupCart();
  setupForm();
  setupHeader();
  renderStars();
  setupReveal();
  $("#year").textContent = new Date().getFullYear();
})();
