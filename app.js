/* Christmas Dinner plate orders — local only, no accounts */
(function () {
  "use strict";

  const VERSION = "202611241250";
  const STORAGE_KEY = "christmas-dinner-v1";
  const TOAST_MS = 5000;

  const MENU = [
    { id: "chicken", name: "Chicken", color: "#c44b32", tile: "food-chicken" },
    { id: "stuffing", name: "Stuffing", color: "#b8864a", tile: "food-stuffing" },
    { id: "parsnips", name: "Parsnips", color: "#c9a24a", tile: "food-parsnip" },
    { id: "peas", name: "Peas", color: "#5a9e3a", tile: "food-peas" },
    { id: "gravy", name: "Gravy", color: "#8a5a32", tile: "food-gravy" },
    { id: "potatoes", name: "Roast Potatoes", color: "#d4a03c", tile: "food-potato" },
    { id: "sprouts", name: "Brussel Sprouts", color: "#6b8f3a", tile: "food-sprout" },
    { id: "carrots", name: "Carrots", color: "#e07a2f", tile: "food-carrot" },
    { id: "yorkshire", name: "Yorkshire Pudding", color: "#e0a040", tile: "food-yorkshire" },
    { id: "pigs", name: "Pigs in Blankets", color: "#c46a4a", tile: "food-pig" }
  ];

  const DEFAULT_DINERS = [
    { id: "grandad-mark", name: "Grandad Mark" },
    { id: "nanny-emma", name: "Nanny Emma" },
    { id: "daddy-uncle-mark", name: "Daddy/Uncle Mark" },
    { id: "mummy-aunty-izzy", name: "Mummy/Aunty Izzy" },
    { id: "uncle-daddy-daniel", name: "Uncle/Daddy Daniel" },
    { id: "billy", name: "Billy" },
    { id: "george", name: "George" },
    { id: "max", name: "Max" }
  ];

  const PORTION_WORD = { S: "Small", M: "Medium", L: "Large" };
  const PORTION_SCALE = { S: 0.82, M: 1, L: 1.16 };

  /* Positions are % of the plate (centre origin via translate -50%). */
  const SLOTS = {
    yorkshire: { x: 34, y: 27, w: 40 },
    peas:      { x: 20, y: 33, w: 36 },
    chicken:   { x: 66, y: 33, w: 50 },
    gravy:     { x: 78, y: 22, w: 28 },
    stuffing:  { x: 48, y: 50, w: 38 },
    parsnips:  { x: 20, y: 54, w: 38 },
    pigs:      { x: 76, y: 52, w: 42 },
    potatoes:  { x: 28, y: 73, w: 42 },
    carrots:   { x: 52, y: 75, w: 40 },
    sprouts:   { x: 76, y: 73, w: 38 }
  };

  /* Cluster recipes: more pieces for larger portions. Coords in 0–100 viewBox. */
  function pieces(id, portion) {
    const n = { S: 0, M: 1, L: 2 }[portion]; // extra count helper
    if (id === "chicken") {
      const slices = [
        { symbol: "food-chicken-slice", x: 8, y: 18, s: 58, r: -18 },
        { symbol: "food-chicken-slice", x: 22, y: 32, s: 58, r: -4 },
        { symbol: "food-chicken-slice", x: 10, y: 46, s: 54, r: 12 }
      ];
      const out = slices.slice(0, portion === "S" ? 2 : 3);
      if (portion === "L") out.push({ symbol: "food-chicken-drum", x: 48, y: 22, s: 48, r: 16 });
      return out;
    }
    if (id === "potatoes") {
      const all = [
        { symbol: "food-potato", x: 4,  y: 28, s: 46, r: -12 },
        { symbol: "food-potato", x: 28, y: 16, s: 48, r: 18 },
        { symbol: "food-potato", x: 20, y: 42, s: 44, r: -6 },
        { symbol: "food-potato", x: 44, y: 36, s: 46, r: 22 },
        { symbol: "food-potato", x: 8,  y: 52, s: 42, r: 10 },
        { symbol: "food-potato", x: 36, y: 54, s: 44, r: -20 }
      ];
      return all.slice(0, portion === "S" ? 2 : portion === "M" ? 4 : 6);
    }
    if (id === "sprouts") {
      const all = [
        { symbol: "food-sprout",     x: 8,  y: 22, s: 44, r: -8 },
        { symbol: "food-sprout-cut", x: 32, y: 16, s: 42, r: 10 },
        { symbol: "food-sprout",     x: 18, y: 42, s: 42, r: 6 },
        { symbol: "food-sprout-cut", x: 42, y: 40, s: 40, r: -14 },
        { symbol: "food-sprout",     x: 6,  y: 50, s: 38, r: 16 },
        { symbol: "food-sprout",     x: 30, y: 54, s: 38, r: -6 }
      ];
      return all.slice(0, portion === "S" ? 2 : portion === "M" ? 4 : 6);
    }
    if (id === "carrots") {
      const all = [
        { symbol: "food-carrot", x: 6,  y: 28, s: 70, r: -16 },
        { symbol: "food-carrot", x: 16, y: 42, s: 64, r: 10 },
        { symbol: "food-carrot", x: 4,  y: 50, s: 62, r: -28 },
        { symbol: "food-carrot", x: 28, y: 30, s: 60, r: 24 },
        { symbol: "food-carrot", x: 22, y: 54, s: 58, r: 4 }
      ];
      return all.slice(0, portion === "S" ? 2 : portion === "M" ? 3 : 5);
    }
    if (id === "parsnips") {
      const all = [
        { symbol: "food-parsnip", x: 8,  y: 16, s: 70, r: -8 },
        { symbol: "food-parsnip", x: 20, y: 36, s: 64, r: 18 },
        { symbol: "food-parsnip", x: 4,  y: 44, s: 62, r: -22 },
        { symbol: "food-parsnip", x: 28, y: 22, s: 58, r: 8 }
      ];
      return all.slice(0, portion === "S" ? 2 : portion === "M" ? 3 : 4);
    }
    if (id === "pigs") {
      const all = [
        { symbol: "food-pig", x: 6,  y: 22, s: 70, r: -8 },
        { symbol: "food-pig", x: 16, y: 42, s: 64, r: 16 },
        { symbol: "food-pig", x: 4,  y: 52, s: 60, r: -18 },
        { symbol: "food-pig", x: 24, y: 14, s: 58, r: 22 },
        { symbol: "food-pig", x: 28, y: 50, s: 58, r: 4 }
      ];
      return all.slice(0, portion === "S" ? 2 : portion === "M" ? 3 : 5);
    }
    if (id === "peas") {
      const s = portion === "S" ? 78 : portion === "M" ? 92 : 108;
      return [{ symbol: "food-peas", x: 50 - s / 2, y: 50 - s / 2, s: s, r: 0 }];
    }
    if (id === "stuffing") {
      const s = portion === "S" ? 76 : portion === "M" ? 92 : 110;
      return [{ symbol: "food-stuffing", x: 50 - s / 2, y: 50 - s / 2, s: s, r: 0 }];
    }
    if (id === "yorkshire") {
      const s = portion === "S" ? 78 : portion === "M" ? 94 : 112;
      return [{ symbol: "food-yorkshire", x: 50 - s / 2, y: 50 - s / 2, s: s, r: -6 }];
    }
    if (id === "gravy") {
      const s = portion === "S" ? 80 : portion === "M" ? 94 : 112;
      return [{ symbol: "food-gravy", x: 50 - s / 2, y: 50 - s / 2, s: s, r: 8 }];
    }
    return [];
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function defaultState() {
    return {
      v: 1,
      diners: DEFAULT_DINERS.map((d) => ({ ...d })),
      current: DEFAULT_DINERS[0].id,
      plates: {},
      ordered: {}
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.diners) || !s.diners.length) return defaultState();
      s.plates = s.plates || {};
      s.ordered = s.ordered || {};
      if (!s.diners.some((d) => d.id === s.current)) s.current = s.diners[0].id;
      return s;
    } catch (e) {
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      toast("Could not save on this phone. The plates may be lost if the page is closed.");
    }
  }

  let state = load();
  let toastTimer = 0;
  let lastAdded = null; // { dinerId, foodId } — animate only this
  let pulseId = null;
  let choosing = null; // food id for portion sheet

  function currentDiner() {
    return state.diners.find((d) => d.id === state.current) || state.diners[0];
  }
  function currentPlate() {
    return state.plates[state.current] || {};
  }
  function dinerIndex() {
    return Math.max(0, state.diners.findIndex((d) => d.id === state.current));
  }

  function toast(msg, ms) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms == null ? TOAST_MS : ms);
  }

  function menuItem(id) {
    return MENU.find((m) => m.id === id);
  }

  /* ---------- render ---------- */
  function render() {
    renderMenu();
    renderDiner();
    renderPlate();
    updateMenuArrows();
  }

  function renderMenu() {
    const plate = currentPlate();
    const root = $("#menuList");
    const html = MENU.map((m) => {
      const p = plate[m.id];
      const on = p ? " on" : "";
      const badge = p ? `<span class="badge">${p}</span>` : "";
      return `<button type="button" class="tile${on}" data-food="${m.id}" style="background:${m.color}" aria-pressed="${p ? "true" : "false"}">
        <svg class="art" viewBox="0 0 100 100" aria-hidden="true"><use href="#${m.tile}"></use></svg>
        <span class="label">${escapeHtml(m.name)}</span>
        ${badge}
      </button>`;
    }).join("");
    root.innerHTML = html;
  }

  function renderDiner() {
    const d = currentDiner();
    $("#dinerName").textContent = d.name;
    const menu = $("#dinerDropdown");
    menu.innerHTML = state.diners.map((x) => {
      const cur = x.id === state.current ? " current" : "";
      const tick = x.id === state.current ? `<span class="tick">✓</span>` : "";
      const saved = state.ordered[x.id] ? `<span class="saved">saved</span>` : "";
      return `<button type="button" data-diner="${x.id}" class="${cur.trim()}">
        <span>${escapeHtml(x.name)}</span>
        <span>${saved}${tick}</span>
      </button>`;
    }).join("");
  }

  function renderPlate() {
    const plate = currentPlate();
    const host = $("#plate");
    const hint = $("#plateHint");
    const ids = MENU.map((m) => m.id).filter((id) => plate[id]);
    hint.hidden = ids.length > 0;

    $$(".on-plate, .gravy-drizzle", host).forEach((n) => n.remove());

    ids.forEach((id) => {
      const portion = plate[id];
      const slot = SLOTS[id];
      const scale = PORTION_SCALE[portion] || 1;
      const w = slot.w * scale;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "on-plate";
      btn.dataset.food = id;
      btn.setAttribute("aria-label", `${menuItem(id).name}, ${PORTION_WORD[portion]}. Tap to change the amount.`);
      btn.style.left = slot.x + "%";
      btn.style.top = slot.y + "%";
      btn.style.width = w + "%";
      btn.style.height = w + "%";
      const parts = pieces(id, portion)
        .map((p) => {
          return `<g transform="translate(${p.x} ${p.y}) rotate(${p.r} ${p.s / 2} ${p.s / 2})">
            <svg x="0" y="0" width="${p.s}" height="${p.s}" viewBox="0 0 100 100">
              <use href="#${p.symbol}"></use>
            </svg>
          </g>`;
        })
        .join("");
      btn.innerHTML = `<svg viewBox="0 0 100 100">${parts}</svg><span class="pbadge">${portion}</span>`;
      if (lastAdded && lastAdded.dinerId === state.current && lastAdded.foodId === id) {
        btn.classList.add("pop");
      } else if (pulseId === id) {
        btn.classList.add("pulse");
      }
      host.appendChild(btn);
    });

    if (plate.gravy && plate.chicken) {
      const drip = document.createElement("div");
      drip.className = "gravy-drizzle";
      drip.style.left = "54%";
      drip.style.top = "28%";
      drip.style.width = "22%";
      drip.style.height = "22%";
      drip.style.transform = "translate(-50%,-50%)";
      drip.innerHTML = `<svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M28 8c8 6 14 10 10 22 6 2 8 10 4 18-2 4-8 6-6 2 8-10 6-18-2-22-2 10-8 16-6 6-2-10 2-20 0-26z" fill="#5a2e10" opacity=".8"/>
        <ellipse cx="44" cy="52" rx="14" ry="7" fill="#5a2e10" opacity=".72"/>
        <ellipse cx="40" cy="50" rx="6" ry="2.2" fill="#fff" opacity=".18"/>
      </svg>`;
      host.appendChild(drip);
    }

    lastAdded = null;
    pulseId = null;
  }

  function updateMenuArrows() {
    const list = $("#menuList");
    const max = Math.max(0, list.scrollHeight - list.clientHeight);
    $("#menuUp").disabled = list.scrollTop <= 2;
    $("#menuDown").disabled = list.scrollTop >= max - 2;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- diner navigation ---------- */
  function goTo(id, opts) {
    if (!state.diners.some((d) => d.id === id)) return;
    state.current = id;
    save();
    closeDropdown();
    render();
    if (opts && opts.toast) toast(opts.toast);
  }

  function stepDiner(dir) {
    const i = dinerIndex();
    const next = state.diners[(i + dir + state.diners.length) % state.diners.length];
    goTo(next.id);
  }

  function closeDropdown() {
    $("#dinerDropdown").hidden = true;
  }

  /* ---------- plate edits ---------- */
  function addOrOpen(foodId) {
    const plate = { ...currentPlate() };
    if (!plate[foodId]) {
      plate[foodId] = "M";
      state.plates[state.current] = plate;
      lastAdded = { dinerId: state.current, foodId };
      save();
      render();
    } else {
      openPortion(foodId);
    }
  }

  function setPortion(foodId, portion) {
    const plate = { ...currentPlate() };
    if (portion === null) {
      delete plate[foodId];
    } else {
      plate[foodId] = portion;
      pulseId = foodId;
    }
    if (Object.keys(plate).length) state.plates[state.current] = plate;
    else delete state.plates[state.current];
    save();
    render();
  }

  function openPortion(foodId) {
    choosing = foodId;
    const item = menuItem(foodId);
    const plate = currentPlate();
    const cur = plate[foodId] || "M";
    $("#portionTitle").textContent = item.name;
    $$(".portion-opt").forEach((b) => {
      b.classList.toggle("on", b.dataset.portion === cur);
    });
    $("#portion").hidden = false;
  }

  function closePortion() {
    choosing = null;
    $("#portion").hidden = true;
  }

  /* ---------- order / list ---------- */
  function placeOrder() {
    const d = currentDiner();
    const plate = currentPlate();
    const empty = !Object.keys(plate).length;
    state.ordered[d.id] = true;
    save();

    const i = dinerIndex();
    const isLast = i === state.diners.length - 1;
    if (isLast) {
      toast(empty
        ? `${d.name}'s plate is empty, and that is everyone. Here is the list for the kitchen.`
        : `Lovely — ${d.name}'s plate is saved. That's everyone. Here is the list for the kitchen.`);
      render();
      openList();
      return;
    }
    const next = state.diners[i + 1];
    toast(empty
      ? `Saved — nothing on ${d.name}'s plate. Now for ${next.name}.`
      : `Lovely — ${d.name}'s plate is saved. Now for ${next.name}.`);
    goTo(next.id);
  }

  function itemsLine(plate) {
    return MENU.filter((m) => plate[m.id]).map((m) => {
      return { name: m.name, portion: plate[m.id], word: PORTION_WORD[plate[m.id]] };
    });
  }

  function totalsMap() {
    const totals = {};
    MENU.forEach((m) => { totals[m.id] = { S: 0, M: 0, L: 0, name: m.name }; });
    state.diners.forEach((d) => {
      const plate = state.plates[d.id] || {};
      Object.keys(plate).forEach((id) => {
        if (totals[id]) totals[id][plate[id]] += 1;
      });
    });
    return totals;
  }

  function formatTotals(t) {
    const parts = [];
    if (t.L) parts.push(`${t.L} L`);
    if (t.M) parts.push(`${t.M} M`);
    if (t.S) parts.push(`${t.S} S`);
    return parts.join(", ");
  }

  function renderList() {
    const body = $("#listBody");
    const cards = state.diners.map((d) => {
      const items = itemsLine(state.plates[d.id] || {});
      const inner = items.length
        ? `<ul>${items.map((it) => `<li><span>${escapeHtml(it.name)}</span><span class="portion-w">${escapeHtml(it.word)}</span></li>`).join("")}</ul>`
        : `<p class="empty-line">Nothing chosen yet</p>`;
      return `<article class="diner-card"><h3>${escapeHtml(d.name)}</h3>${inner}</article>`;
    }).join("");

    const totals = totalsMap();
    const tRows = MENU.map((m) => totals[m.id])
      .filter((t) => t.S + t.M + t.L > 0)
      .map((t) => `<li><span>${escapeHtml(t.name)}</span><span>${escapeHtml(formatTotals(t))}</span></li>`)
      .join("");
    const totalsHtml = tRows
      ? `<section class="totals"><h3>Totals for the kitchen</h3><ul>${tRows}</ul></section>`
      : `<section class="totals"><h3>Totals for the kitchen</h3><p class="empty-line">No food has been chosen yet.</p></section>`;

    body.innerHTML = `
      <h2 class="print-title">Christmas Dinner orders<small>Kitchen list</small></h2>
      <div class="sheet-actions no-print">
        <button type="button" class="btn btn-list" id="printBtn">Print <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></svg></button>
        <button type="button" class="btn btn-order" id="shareBtn">Share / Save the list</button>
      </div>
      ${cards}
      ${totalsHtml}
    `;
  }

  function listText() {
    const lines = ["Christmas Dinner orders", ""];
    state.diners.forEach((d) => {
      const items = itemsLine(state.plates[d.id] || {});
      if (items.length) {
        lines.push(`${d.name}: ${items.map((it) => `${it.name} (${it.portion})`).join(", ")}`);
      } else {
        lines.push(`${d.name}: nothing chosen yet`);
      }
    });
    lines.push("", "Totals");
    const totals = totalsMap();
    let any = false;
    MENU.forEach((m) => {
      const t = totals[m.id];
      if (t.S + t.M + t.L) {
        lines.push(`${t.name}: ${formatTotals(t)}`);
        any = true;
      }
    });
    if (!any) lines.push("No food has been chosen yet.");
    return lines.join("\n");
  }

  function openList() {
    renderList();
    $("#listView").hidden = false;
    closeDropdown();
  }
  function closeList() {
    $("#listView").hidden = true;
  }

  async function shareList() {
    const text = listText();
    const title = "Christmas Dinner orders";
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    downloadList(text);
  }

  function downloadList(text) {
    const blob = new Blob([text || listText()], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "christmas-dinner-orders.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
    toast("The list has been saved as a text file.");
  }

  /* ---------- settings ---------- */
  function openSettings() {
    renderSettings();
    $("#settingsView").hidden = false;
    closeDropdown();
  }
  function closeSettings() {
    $("#settingsView").hidden = true;
  }
  function renderSettings() {
    const ul = $("#settingsList");
    ul.innerHTML = state.diners.map((d) => {
      const canRemove = state.diners.length > 1;
      return `<li data-diner="${d.id}">
        <span class="nm">${escapeHtml(d.name)}</span>
        <button type="button" data-act="rename">Rename</button>
        ${canRemove ? `<button type="button" class="danger" data-act="remove">Remove</button>` : ""}
      </li>`;
    }).join("");
  }

  function confirmModal(message, okLabel, danger, onOk) {
    $("#confirmMsg").textContent = message;
    const ok = $("#confirmOk");
    ok.textContent = okLabel || "Yes";
    ok.className = danger ? "btn-danger" : "btn-ok";
    $("#confirm").hidden = false;
    confirmModal._onOk = onOk;
  }
  function closeConfirm() {
    $("#confirm").hidden = true;
    confirmModal._onOk = null;
  }

  function startAgain() {
    confirmModal(
      "This will clear every plate and start again. The diner names will be kept. Are you sure?",
      "Yes, start again",
      true,
      () => {
        state.plates = {};
        state.ordered = {};
        state.current = state.diners[0].id;
        save();
        closeConfirm();
        closeSettings();
        closeList();
        render();
        toast("All plates have been cleared. Ready to start again.");
      }
    );
  }

  function addDiner(name) {
    name = (name || "").trim();
    if (!name) {
      toast("Please type a name first.");
      return false;
    }
    const id = "diner-" + Date.now().toString(36);
    state.diners.push({ id, name });
    save();
    renderSettings();
    renderDiner();
    return true;
  }

  function renameDiner(id, name) {
    name = (name || "").trim();
    if (!name) {
      toast("Please type a name first.");
      return false;
    }
    const d = state.diners.find((x) => x.id === id);
    if (!d) return false;
    d.name = name;
    save();
    renderSettings();
    render();
    return true;
  }

  function removeDiner(id) {
    if (state.diners.length <= 1) return;
    const d = state.diners.find((x) => x.id === id);
    confirmModal(
      `Remove ${d.name} from the list? Their plate will be forgotten.`,
      "Yes, remove",
      true,
      () => {
        state.diners = state.diners.filter((x) => x.id !== id);
        delete state.plates[id];
        delete state.ordered[id];
        if (state.current === id) state.current = state.diners[0].id;
        save();
        closeConfirm();
        renderSettings();
        render();
      }
    );
  }

  /* ---------- swipe between diners ---------- */
  function bindSwipe(el) {
    let startX = 0, startY = 0, tracking = false, moved = false;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      tracking = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
    });
    el.addEventListener("pointermove", (e) => {
      if (!tracking) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) moved = true;
    });
    function end(e) {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        stepDiner(dx < 0 ? 1 : -1);
      }
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", () => { tracking = false; });
    // prevent a leftover click after a swipe opening the portion sheet
    el.addEventListener("click", (e) => {
      if (moved && Math.abs(e.clientX - startX) > 50) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);
  }

  /* ---------- events ---------- */
  function bind() {
    $("#menuList").addEventListener("click", (e) => {
      const tile = e.target.closest("[data-food]");
      if (tile) addOrOpen(tile.dataset.food);
    });
    $("#menuList").addEventListener("scroll", updateMenuArrows, { passive: true });
    $("#menuUp").addEventListener("click", () => {
      const list = $("#menuList");
      const tile = list.querySelector(".tile");
      list.scrollBy({ top: -(tile ? tile.offsetHeight + 8 : 100), behavior: "smooth" });
    });
    $("#menuDown").addEventListener("click", () => {
      const list = $("#menuList");
      const tile = list.querySelector(".tile");
      list.scrollBy({ top: tile ? tile.offsetHeight + 8 : 100, behavior: "smooth" });
    });

    $("#prevDiner").addEventListener("click", () => stepDiner(-1));
    $("#nextDiner").addEventListener("click", () => stepDiner(1));
    $("#dinerBtn").addEventListener("click", () => {
      const dd = $("#dinerDropdown");
      dd.hidden = !dd.hidden;
    });
    $("#dinerDropdown").addEventListener("click", (e) => {
      const b = e.target.closest("[data-diner]");
      if (b) goTo(b.dataset.diner);
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".diner-wrap")) closeDropdown();
    });

    $("#plate").addEventListener("click", (e) => {
      const b = e.target.closest(".on-plate");
      if (b) openPortion(b.dataset.food);
    });
    bindSwipe($("#plateCard"));

    $("#orderBtn").addEventListener("click", placeOrder);
    $("#listBtn").addEventListener("click", openList);
    $("#settingsBtn").addEventListener("click", openSettings);

    $("#portion").addEventListener("click", (e) => {
      if (e.target.id === "portion") closePortion();
    });
    $$(".portion-opt").forEach((b) => {
      b.addEventListener("click", () => {
        if (!choosing) return;
        setPortion(choosing, b.dataset.portion);
        closePortion();
      });
    });
    $("#portionRemove").addEventListener("click", () => {
      if (!choosing) return;
      const name = menuItem(choosing).name;
      setPortion(choosing, null);
      closePortion();
      toast(`${name} has been taken off the plate.`);
    });
    $("#portionClose").addEventListener("click", closePortion);

    $("#listView").addEventListener("click", (e) => {
      if (e.target.closest("#closeList")) closeList();
      if (e.target.closest("#printBtn")) window.print();
      if (e.target.closest("#shareBtn")) shareList();
    });
    $("#closeSettings").addEventListener("click", closeSettings);
    $("#startAgain").addEventListener("click", startAgain);
    $("#addDinerBtn").addEventListener("click", () => {
      const input = $("#newDinerName");
      if (addDiner(input.value)) {
        input.value = "";
        toast("Diner added.");
      }
    });
    $("#newDinerName").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        $("#addDinerBtn").click();
      }
    });
    $("#settingsList").addEventListener("click", (e) => {
      const li = e.target.closest("li[data-diner]");
      if (!li) return;
      const id = li.dataset.diner;
      const act = e.target.dataset.act;
      if (act === "rename") {
        const d = state.diners.find((x) => x.id === id);
        $("#renameId").value = id;
        $("#renameInput").value = d.name;
        $("#renameModal").hidden = false;
        setTimeout(() => $("#renameInput").focus(), 50);
      }
      if (act === "remove") removeDiner(id);
    });
    $("#renameCancel").addEventListener("click", () => { $("#renameModal").hidden = true; });
    $("#renameSave").addEventListener("click", () => {
      if (renameDiner($("#renameId").value, $("#renameInput").value)) {
        $("#renameModal").hidden = true;
        toast("Name saved.");
      }
    });
    $("#confirmCancel").addEventListener("click", closeConfirm);
    $("#confirmOk").addEventListener("click", () => {
      if (typeof confirmModal._onOk === "function") confirmModal._onOk();
    });
    $("#confirm").addEventListener("click", (e) => {
      if (e.target.id === "confirm") closeConfirm();
    });
    $("#renameModal").addEventListener("click", (e) => {
      if (e.target.id === "renameModal") $("#renameModal").hidden = true;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closePortion();
        closeConfirm();
        closeDropdown();
        $("#renameModal").hidden = true;
        if (!$("#listView").hidden) closeList();
        else if (!$("#settingsView").hidden) closeSettings();
      }
    });
  }

  /* ---------- PWA ---------- */
  function registerSw() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  function ready() {
    $("#appVersion").textContent = "Version " + VERSION;
    bind();
    render();
    registerSw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
