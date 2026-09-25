/**
 * Plate Ledger — UI.
 *
 * Holds the in-memory view of the ledger, renders it, and pushes every change
 * through whichever store backend is live. Nothing here knows about Firebase
 * beyond asking store.js for a cloud backend when someone signs in.
 */
import { BUILT_IN, mkFood, unitsFor, searchFoods } from "./foods.js";
import { LocalBackend, CloudBackend, ls } from "./store.js";
import { isConfigured, loadFirebase, watchUser, signIn, signOutNow } from "./firebase.js";
import { lookupFood, GeminiError } from "./gemini.js";

/* ===================== small helpers ===================== */

const $ = (id) => document.getElementById(id);
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const g1 = (n) => (n < 10 && n > 0 ? n.toFixed(1) : Math.round(n).toString());

const keyOf = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateFromKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const todayKey = () => keyOf(new Date());
const prettyDate = (k) =>
  dateFromKey(k).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

function lastSevenKeys() {
  const out = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    out.push(keyOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
  }
  return out;
}

/* ===================== state ===================== */

const state = {
  entries: [],
  customFoods: [],
  maintenance: 2400,
  apiKey: "",
  viewDate: todayKey(),
  demo: false,
  user: null,
};

let foods = BUILT_IN.slice();
let backend = new LocalBackend();
let unsubscribe = null;
let selectedFood = null;

/** Scale a food to an amount of one of its units. */
function computeEntry(food, amount, unitLabel, date) {
  const unit = unitsFor(food).find((u) => u[0] === unitLabel) || ["g", 1];
  const grams = amount * unit[1];
  const r = grams / 100;
  return {
    id: "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date,
    name: food.name,
    amount,
    unit: unit[0],
    grams,
    kcal: food.k * r,
    p: food.p * r,
    c: food.c * r,
    f: food.f * r,
    x: food.x * r,
    ts: Date.now(),
  };
}

/** A South-Indian-leaning example week, shown until the first real entry. */
function buildDemo() {
  const plan = [
    [["idli", 3, "idli"], ["sambar", 1, "cup"], ["coconut chutney", 2, "tbsp"],
     ["filter coffee", 2, "tumbler"], ["curd rice", 1, "cup"],
     ["chicken curry", 1, "cup"], ["banana", 1, "medium"]],
    [["dosa, plain", 2, "dosa"], ["coconut chutney", 2, "tbsp"], ["sambar", 1, "cup"],
     ["lemon rice", 1, "cup"], ["poriyal, green beans", 1, "cup"], ["curd, plain", 1, "cup"]],
    [["upma", 1, "bowl"], ["medu vada", 2, "vada"], ["rasam", 1, "cup"],
     ["basmati rice, cooked", 1, "cup"], ["dal tadka", 1, "cup"], ["papad", 2, "papad"],
     ["orange", 1, "medium"]],
    [["ven pongal", 1, "cup"], ["chicken biryani", 1, "plate"], ["raita", 1, "cup"],
     ["gulab jamun", 1, "piece"]],
    [["ragi dosa", 2, "dosa"], ["peanut chutney", 2, "tbsp"], ["white rice, cooked", 1, "cup"],
     ["sambar", 1, "cup"], ["avial", 1, "cup"], ["filter coffee", 2, "tumbler"]],
    [["poha", 1, "cup"], ["masala dosa", 1, "dosa"], ["chettinad chicken", 1, "cup"],
     ["chapati", 2, "roti"], ["payasam", 1, "cup"]],
    [["idli", 2, "idli"], ["sambar", 1, "cup"], ["curd rice", 1, "cup"],
     ["chicken 65", 3, "piece"]],
  ];
  const out = [];
  lastSevenKeys().forEach((key, di) => {
    plan[di].forEach((row, ei) => {
      const food = BUILT_IN.find((f) => f.name === row[0]);
      if (!food) return;
      const entry = computeEntry(food, row[1], row[2], key);
      entry.id = `demo-${di}-${ei}`;
      entry.ts = di * 1e6 + ei;
      out.push(entry);
    });
  });
  return out;
}

const isDemoId = (id) => String(id).startsWith("demo-");

/* ===================== store wiring ===================== */

function applySnapshot(snap) {
  const real = (snap.entries || []).filter((e) => e && typeof e.kcal === "number" && e.date);
  if (real.length) {
    state.entries = real;
    state.demo = false;
  } else {
    state.entries = buildDemo();
    state.demo = true;
  }

  state.customFoods = snap.customFoods || [];
  foods = BUILT_IN.concat(
    state.customFoods.map((f) => mkFood([f.name, f.k, f.p, f.c, f.f, f.x, f.s || []], true)),
  );

  if (typeof snap.settings?.maintenance === "number") {
    state.maintenance = snap.settings.maintenance;
    if (document.activeElement !== $("maintenance")) $("maintenance").value = state.maintenance;
  }
  state.apiKey = typeof snap.settings?.geminiKey === "string" ? snap.settings.geminiKey : "";
  renderKeyStatus();
  renderAll();
}

function useBackend(next) {
  if (unsubscribe) unsubscribe();
  backend = next;
  unsubscribe = backend.subscribe(applySnapshot, (err) => {
    showNotice(
      "cloud",
      `Couldn't reach your saved data (${err?.code || "unknown error"}). Still logging on this device.`,
    );
  });
}

/* ===================== auth ===================== */

async function startAuth() {
  if (!isConfigured()) {
    $("signinBtn").hidden = true;
    $("setupNotice").hidden = false;
    return;
  }
  $("signinBtn").hidden = false;

  try {
    await watchUser(async (user) => {
      state.user = user;
      renderAccount();
      if (user) {
        const { fs, db } = await loadFirebase();
        const cloud = new CloudBackend(fs, db, user.uid);
        const local = new LocalBackend();
        const pending = local.snapshot().entries.filter((e) => !isDemoId(e.id));
        useBackend(cloud);
        if (pending.length) offerImport(cloud, local, pending);
      } else {
        useBackend(new LocalBackend());
      }
    });
  } catch (err) {
    $("signinBtn").hidden = true;
    showNotice("cloud", `Sign-in is unavailable: ${err?.message || err}`);
  }
}

/** Ask before copying device-local entries into a freshly signed-in account. */
function offerImport(cloud, local, pending) {
  const bar = $("importBar");
  $("importText").textContent =
    `${pending.length} ${pending.length === 1 ? "entry" : "entries"} logged on this device before you signed in.`;
  bar.hidden = false;

  $("importYes").onclick = async () => {
    bar.hidden = true;
    try {
      await cloud.importEntries(pending);
      local.clearEntries();
    } catch (err) {
      showNotice("cloud", `Couldn't copy those entries: ${err?.code || err}`);
    }
  };
  $("importNo").onclick = () => {
    bar.hidden = true;
  };
}

function renderAccount() {
  const user = state.user;
  const signedIn = Boolean(user);
  $("signinBtn").hidden = signedIn || !isConfigured();
  $("account").hidden = !signedIn;
  if (!signedIn) return;
  const img = $("acctAvatar");
  if (user.photoURL) {
    img.src = user.photoURL;
    img.hidden = false;
  } else {
    img.hidden = true;
  }
  $("acctName").textContent = user.displayName || user.email || "Signed in";
  $("acctState").textContent = "synced to your account";
}

$("signinBtn").addEventListener("click", async () => {
  const btn = $("signinBtn");
  btn.disabled = true;
  try {
    await signIn();
  } catch (err) {
    showNotice("cloud", `Sign-in failed: ${err?.code || err?.message || err}`);
  } finally {
    btn.disabled = false;
  }
});

$("signoutBtn").addEventListener("click", async () => {
  try {
    await signOutNow();
  } catch {
    /* onAuthStateChanged still fires on a successful sign-out */
  }
});

function showNotice(id, text) {
  const box = $("noticeBar");
  $("noticeText").textContent = text;
  box.hidden = false;
}
$("noticeClose").addEventListener("click", () => {
  $("noticeBar").hidden = true;
});

/* ===================== theme ===================== */

const savedTheme = ls.read("pl.theme", null);
if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", savedTheme);
}
$("themeBtn").addEventListener("click", () => {
  const root = document.documentElement;
  const current =
    root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  ls.write("pl.theme", next);
});

/* ===================== composer ===================== */

const foodInput = $("foodName");
const suggBox = $("suggBox");
const suggList = $("suggList");
const amountInput = $("amount");
const unitSelect = $("unit");
const addBtn = $("addBtn");

let suggItems = [];
let suggIndex = -1;

function closeSuggestions() {
  suggBox.hidden = true;
  suggIndex = -1;
  suggItems = [];
  foodInput.setAttribute("aria-expanded", "false");
}

function openSuggestions(list) {
  suggItems = list;
  suggList.replaceChildren();
  list.forEach((food, i) => {
    const li = document.createElement("li");
    li.id = `sugg-${i}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");

    const name = document.createElement("span");
    name.className = "nm";
    name.textContent = food.name;

    const kcal = document.createElement("span");
    kcal.className = "kc";
    kcal.textContent = `${Math.round(food.k)} kcal / 100 g`;

    li.append(name, kcal);
    li.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      pickFood(food);
    });
    suggList.append(li);
  });
  suggBox.hidden = list.length === 0;
  foodInput.setAttribute("aria-expanded", list.length ? "true" : "false");
  suggIndex = -1;
}

function highlight(i) {
  [...suggList.children].forEach((el, n) =>
    el.setAttribute("aria-selected", n === i ? "true" : "false"),
  );
  if (i >= 0) suggList.children[i].scrollIntoView({ block: "nearest" });
}

function fillUnits(food) {
  unitSelect.replaceChildren();
  for (const [label, grams] of unitsFor(food)) {
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label === "g" || label === "oz" ? label : `${label} (${g1(grams)} g)`;
    unitSelect.append(opt);
  }
}

function pickFood(food) {
  selectedFood = food;
  foodInput.value = food.name;
  fillUnits(food);
  const first = unitsFor(food)[0];
  unitSelect.value = first[0];
  amountInput.value = first[0] === "g" ? 100 : 1;
  closeSuggestions();
  renderPreview();
  amountInput.focus();
  amountInput.select();
}

foodInput.addEventListener("input", () => {
  selectedFood = null;
  openSuggestions(searchFoods(foods, foodInput.value));
  renderPreview();
});
foodInput.addEventListener("focus", () => {
  if (foodInput.value.trim() && !selectedFood) {
    openSuggestions(searchFoods(foods, foodInput.value));
  }
});
foodInput.addEventListener("blur", () => setTimeout(closeSuggestions, 120));
foodInput.addEventListener("keydown", (ev) => {
  if (suggBox.hidden) {
    if (ev.key === "ArrowDown" && foodInput.value.trim()) {
      openSuggestions(searchFoods(foods, foodInput.value));
      ev.preventDefault();
    }
    return;
  }
  if (ev.key === "ArrowDown") {
    suggIndex = Math.min(suggIndex + 1, suggItems.length - 1);
    highlight(suggIndex);
    ev.preventDefault();
  } else if (ev.key === "ArrowUp") {
    suggIndex = Math.max(suggIndex - 1, 0);
    highlight(suggIndex);
    ev.preventDefault();
  } else if (ev.key === "Enter") {
    if (suggIndex >= 0) {
      pickFood(suggItems[suggIndex]);
      ev.preventDefault();
    } else if (suggItems.length) {
      pickFood(suggItems[0]);
      ev.preventDefault();
    }
  } else if (ev.key === "Escape") {
    closeSuggestions();
  }
});

amountInput.addEventListener("input", renderPreview);
unitSelect.addEventListener("change", renderPreview);

function currentDraft() {
  if (!selectedFood) return null;
  const amount = parseFloat(amountInput.value);
  if (!(amount > 0)) return null;
  return computeEntry(selectedFood, amount, unitSelect.value, $("entryDate").value || todayKey());
}

function chip(cls, value, label) {
  const span = document.createElement("span");
  span.className = `chip ${cls}`;
  const dot = document.createElement("i");
  const b = document.createElement("b");
  b.textContent = value;
  const t = document.createElement("span");
  t.textContent = label;
  t.style.color = "var(--muted)";
  span.append(dot, b, t);
  return span;
}

function renderPreview() {
  const box = $("preview");
  box.replaceChildren();
  const draft = currentDraft();

  if (!draft) {
    addBtn.disabled = true;
    const typed = foodInput.value.trim();
    const noMatch = typed && !selectedFood && !searchFoods(foods, typed, 1).length;
    const hint = document.createElement("span");
    hint.className = "hint";
    if (!typed) hint.textContent = "Pick a food to see its calories and macros before you add it.";
    else if (noMatch) hint.textContent = `“${typed}” isn’t in the table yet.`;
    else if (!selectedFood) hint.textContent = "Choose one of the matches above.";
    else hint.textContent = "Enter an amount.";
    box.append(hint);

    if (noMatch) {
      const ai = document.createElement("button");
      ai.type = "button";
      ai.className = "ask primary";
      ai.textContent = state.apiKey ? `Look up “${typed}” with Gemini` : "Look up with Gemini — add a key";
      ai.addEventListener("click", () => askGemini(typed, ai));
      box.append(ai);

      const manual = document.createElement("button");
      manual.type = "button";
      manual.className = "ask";
      manual.textContent = "Enter it manually";
      manual.addEventListener("click", () => openCustomForm(typed));
      box.append(manual);
    }
    return;
  }

  addBtn.disabled = false;
  const grams = document.createElement("span");
  grams.className = "chip";
  grams.style.color = "var(--muted)";
  grams.textContent = `= ${g1(draft.grams)} g`;
  box.append(
    chip("c-kcal", fmt(draft.kcal), "kcal"),
    chip("c-p", `${g1(draft.p)} g`, "protein"),
    chip("c-c", `${g1(draft.c)} g`, "carbs"),
    chip("c-x", `${g1(draft.x)} g`, "fat"),
    chip("c-f", `${g1(draft.f)} g`, "fiber"),
    grams,
  );
}

addBtn.addEventListener("click", async () => {
  const draft = currentDraft();
  if (!draft) return;

  if (state.demo) {
    state.entries = [];
    state.demo = false;
  }
  await backend.addEntry(draft);

  foodInput.value = "";
  selectedFood = null;
  amountInput.value = 1;
  unitSelect.replaceChildren();
  renderPreview();
  foodInput.focus();
});

/* ---------- custom foods ---------- */

function openCustomForm(name) {
  $("keyForm").hidden = true;
  $("customForm").hidden = false;
  $("cfHead").textContent = "New food — values per 100 g";
  $("cfNote").hidden = true;
  $("cfName").value = name;
  $("cfKcal").focus();
}

/* ---------- Gemini lookup ---------- */

function openKeyForm() {
  $("customForm").hidden = true;
  $("keyForm").hidden = false;
  $("apiKeyInput").value = state.apiKey || "";
  renderKeyStatus();
  $("apiKeyInput").focus();
}

function renderKeyStatus() {
  const el = $("keyStatus");
  if (!el) return;
  if (state.apiKey) {
    const where = backend.mode === "cloud" ? "your account" : "this browser";
    el.textContent = `A key is saved in ${where}, ending …${state.apiKey.slice(-4)}.`;
  } else {
    el.textContent = "No key saved yet.";
  }
}

$("keyBtn").addEventListener("click", openKeyForm);
$("keyCancel").addEventListener("click", () => { $("keyForm").hidden = true; });
$("keySave").addEventListener("click", async () => {
  const value = $("apiKeyInput").value.trim();
  state.apiKey = value;
  await backend.setSetting("geminiKey", value);
  renderKeyStatus();
  $("keyForm").hidden = true;
  renderPreview();
});

let geminiAbort = null;

async function askGemini(query, button) {
  if (!state.apiKey) {
    openKeyForm();
    return;
  }
  geminiAbort?.abort();
  geminiAbort = new AbortController();

  button.disabled = true;
  button.classList.add("busy");
  button.textContent = "Asking Gemini…";

  try {
    const r = await lookupFood(query, state.apiKey, { signal: geminiAbort.signal });
    const serves = r.servingGrams > 0 && r.servingLabel ? [[r.servingLabel, r.servingGrams]] : [];
    const food = mkFood([r.name, r.kcal, r.protein, r.carbs, r.fiber, r.fat, serves], true);

    await backend.addCustomFood({
      name: food.name, k: food.k, p: food.p, c: food.c, f: food.f, x: food.x, s: food.s,
    });
    foods = foods.filter((f) => f.name !== food.name).concat([food]);

    // Show the filled values so the estimate can be checked or corrected.
    openCustomForm(food.name);
    $("cfKcal").value = food.k;
    $("cfProtein").value = food.p;
    $("cfCarbs").value = food.c;
    $("cfFat").value = food.x;
    $("cfFiber").value = food.f;
    $("cfServeLabel").value = r.servingLabel;
    $("cfServeGrams").value = r.servingGrams || "";
    $("cfHead").textContent = "Estimated by Gemini — values per 100 g";
    $("cfNote").hidden = false;
    $("cfNote").textContent = r.mismatch
      ? "Saved, and already selected below. Heads up: the calories don’t match the macros, so check them before you rely on this one."
      : "Saved, and already selected below. It’s an estimate — correct anything that looks off and save again.";

    pickFood(food);
  } catch (err) {
    button.disabled = false;
    button.classList.remove("busy");
    const code = err instanceof GeminiError ? err.code : "unknown";
    if (code === "no_key" || code === "bad_key") {
      showNotice("gemini", err.message + " Add a working key under “AI key”.");
      openKeyForm();
    } else if (code !== "cancelled") {
      showNotice("gemini", err.message || "Gemini lookup failed.");
    }
    button.textContent = `Look up “${query}” with Gemini`;
  }
}
$("cfCancel").addEventListener("click", () => {
  $("customForm").hidden = true;
});
$("cfSave").addEventListener("click", async () => {
  const name = $("cfName").value.trim().toLowerCase();
  const kcal = parseFloat($("cfKcal").value);
  if (!name || !(kcal >= 0)) return;

  const serveLabel = $("cfServeLabel").value.trim();
  const serveGrams = parseFloat($("cfServeGrams").value);
  const serves = serveLabel && serveGrams > 0 ? [[serveLabel, serveGrams]] : [];

  const food = mkFood(
    [
      name,
      kcal,
      parseFloat($("cfProtein").value) || 0,
      parseFloat($("cfCarbs").value) || 0,
      parseFloat($("cfFiber").value) || 0,
      parseFloat($("cfFat").value) || 0,
      serves,
    ],
    true,
  );

  await backend.addCustomFood({
    name: food.name, k: food.k, p: food.p, c: food.c, f: food.f, x: food.x, s: food.s,
  });
  foods = foods.filter((f) => f.name !== food.name).concat([food]);

  $("customForm").hidden = true;
  ["cfKcal", "cfProtein", "cfCarbs", "cfFat", "cfFiber", "cfServeLabel", "cfServeGrams"].forEach(
    (id) => { $(id).value = ""; },
  );
  pickFood(food);
});

/* ===================== maintenance and date ===================== */

let maintTimer = null;
$("maintenance").addEventListener("input", () => {
  const n = parseInt($("maintenance").value, 10);
  if (!(n >= 800 && n <= 6000)) return;
  state.maintenance = n;
  renderAll();
  clearTimeout(maintTimer);
  maintTimer = setTimeout(() => backend.setMaintenance(n), 500);
});

$("entryDate").addEventListener("change", () => {
  state.viewDate = $("entryDate").value || todayKey();
  renderPreview();
  renderAll();
});

/* ===================== totals ===================== */

function totalsFor(dateKey) {
  const t = { kcal: 0, p: 0, c: 0, f: 0, x: 0, n: 0 };
  for (const e of state.entries) {
    if (e.date !== dateKey) continue;
    t.kcal += e.kcal;
    t.p += e.p;
    t.c += e.c;
    t.f += e.f;
    t.x += e.x || 0;
    t.n += 1;
  }
  return t;
}

/* ===================== render ===================== */

function renderAll() {
  renderDayPanel();
  renderLabel();
  renderBalance();
  renderWeek();
  $("demoBanner").hidden = !state.demo;
  $("todayLabel").textContent = prettyDate(todayKey());
}

function renderDayPanel() {
  const key = state.viewDate;
  const list = $("entryList");
  const rows = state.entries
    .filter((e) => e.date === key)
    .sort((a, b) => (a.ts || 0) - (b.ts || 0));

  $("dayTitle").textContent = key === todayKey() ? "Today" : prettyDate(key);
  $("dayCount").textContent = rows.length ? `${rows.length} ${rows.length === 1 ? "item" : "items"}` : "";
  list.replaceChildren();

  if (!rows.length) {
    const li = document.createElement("li");
    li.style.borderTop = "0";
    const span = document.createElement("span");
    span.className = "empty";
    span.textContent = "Nothing logged for this day yet.";
    li.append(span);
    list.append(li);
    return;
  }

  for (const entry of rows) {
    const li = document.createElement("li");

    const nameCell = document.createElement("div");
    nameCell.className = "e-name";
    const b = document.createElement("b");
    b.textContent = entry.name;
    const small = document.createElement("small");
    small.textContent =
      `${g1(entry.amount)} ${entry.unit}` + (entry.unit === "g" ? "" : ` · ${g1(entry.grams)} g`);
    nameCell.append(b, small);

    const macros = document.createElement("div");
    macros.className = "e-macros";
    [
      [entry.p, "P", "var(--protein)"],
      [entry.c, "C", "var(--carbs)"],
      [entry.x || 0, "F", "var(--fat)"],
      [entry.f, "Fib", "var(--fiber)"],
    ].forEach(([value, label, color]) => {
      const span = document.createElement("span");
      span.style.color = color;
      const strong = document.createElement("b");
      strong.textContent = g1(value);
      span.append(strong, document.createTextNode(label));
      macros.append(span);
    });

    const kcal = document.createElement("div");
    kcal.className = "e-kcal";
    kcal.append(document.createTextNode(fmt(entry.kcal)));
    const unit = document.createElement("small");
    unit.textContent = "kcal";
    kcal.append(unit);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.setAttribute("aria-label", `Remove ${entry.name}`);
    del.textContent = "×";
    del.addEventListener("click", async () => {
      if (isDemoId(entry.id)) {
        state.entries = state.entries.filter((e) => e.id !== entry.id);
        renderAll();
        return;
      }
      await backend.removeEntry(entry.id);
    });

    li.append(nameCell, kcal, del, macros);
    list.append(li);
  }
}

function renderLabel() {
  const t = totalsFor(state.viewDate);
  $("labelDate").textContent = state.viewDate === todayKey() ? "today" : prettyDate(state.viewDate);
  $("calTotal").textContent = fmt(t.kcal);

  const kcal = Math.max(t.kcal, 1);
  const shares = {
    p: (t.p * 4 / kcal) * 100,
    c: (t.c * 4 / kcal) * 100,
    x: (t.x * 9 / kcal) * 100,
    f: (t.f / 28) * 100,
  };

  $("pVal").textContent = `${g1(t.p)} g`;
  $("cVal").textContent = `${g1(t.c)} g`;
  $("xVal").textContent = `${g1(t.x)} g`;
  $("fVal").textContent = `${g1(t.f)} g`;

  $("pMeter").style.width = `${Math.min(100, shares.p)}%`;
  $("cMeter").style.width = `${Math.min(100, shares.c)}%`;
  $("xMeter").style.width = `${Math.min(100, shares.x)}%`;
  $("fMeter").style.width = `${Math.min(100, shares.f)}%`;

  $("pPct").textContent = t.kcal ? `${Math.round(shares.p)}% of calories` : "—";
  $("cPct").textContent = t.kcal ? `${Math.round(shares.c)}% of calories` : "—";
  $("xPct").textContent = t.kcal ? `${Math.round(shares.x)}% of calories` : "—";
  $("fPct").textContent = `${Math.round(shares.f)}% of 28 g DV`;
}

function renderBalance() {
  const t = totalsFor(state.viewDate);
  const maintenance = state.maintenance;
  const net = maintenance - t.kcal;
  const deficit = net >= 0;

  const big = $("netBig");
  big.textContent = (deficit ? "−" : "+") + fmt(Math.abs(net));
  big.className = `big ${deficit ? "is-deficit" : "is-surplus"}`;

  const verdict = $("netVerdict");
  verdict.className = `verdict ${deficit ? "is-deficit" : "is-surplus"}`;
  verdict.textContent = deficit
    ? "kcal under maintenance — deficit"
    : "kcal over maintenance — surplus";

  const lbs = (Math.abs(net) * 7) / 3500;
  $("netRate").textContent =
    t.kcal === 0
      ? "Nothing logged yet for this day."
      : `Held every day, that’s about ${lbs.toFixed(1)} lb ${deficit ? "lost" : "gained"} per week.`;

  const eatenPct = Math.max(0, Math.min(100, (t.kcal / Math.max(maintenance, 1)) * 100));
  const eaten = $("balEaten");
  eaten.style.width = `${eatenPct}%`;
  eaten.style.background = deficit ? "var(--fiber)" : "var(--surplus)";
  $("balRest").style.width = `${100 - eatenPct}%`;
  $("balLeft").textContent = `eaten ${fmt(t.kcal)}`;
  $("balRight").textContent = `maintenance ${fmt(maintenance)}`;
}

function cell(text, cls) {
  const td = document.createElement("td");
  if (cls) td.className = cls;
  td.textContent = text;
  return td;
}

function renderWeek() {
  const days = lastSevenKeys().map((key) => ({ key, ...totalsFor(key) }));
  const maintenance = state.maintenance;
  const peak = Math.max(maintenance * 1.12, ...days.map((d) => d.kcal), 1);

  const plot = $("plot");
  const xaxis = $("xaxis");
  plot.replaceChildren();
  xaxis.replaceChildren();

  /* The bars size against the plot's 132px content box; the maintenance rule
     is absolutely positioned against its 148px padding box. */
  const line = document.createElement("div");
  line.className = "maint-line";
  line.style.bottom = `${(maintenance / peak) * 100 * (132 / 148)}%`;
  const tag = document.createElement("span");
  tag.className = "maint-tag";
  tag.textContent = `maintenance ${fmt(maintenance)}`;
  line.append(tag);
  plot.append(line);

  for (const day of days) {
    const col = document.createElement("div");
    col.className = "day";

    const bar = document.createElement("div");
    bar.className =
      "bar" + (day.kcal > maintenance ? " over" : "") + (day.kcal === 0 ? " zero" : "");
    bar.style.height = `${Math.max(day.kcal === 0 ? 2 : 4, (day.kcal / peak) * 100)}%`;
    bar.title = `${prettyDate(day.key)} — ${fmt(day.kcal)} kcal`;
    if (day.kcal > 0) {
      const value = document.createElement("span");
      value.className = "bar-val";
      value.textContent = fmt(day.kcal);
      bar.append(value);
    }
    col.append(bar);
    plot.append(col);

    const label = document.createElement("div");
    label.textContent = DAY[dateFromKey(day.key).getDay()];
    if (day.key === todayKey()) label.className = "today";
    xaxis.append(label);
  }

  const logged = days.filter((d) => d.kcal > 0);
  const avg = logged.length ? logged.reduce((s, d) => s + d.kcal, 0) / logged.length : 0;
  $("weekAvg").textContent = logged.length ? `avg ${fmt(avg)} kcal` : "no days logged";

  const body = $("weekBody");
  const foot = $("weekFoot");
  body.replaceChildren();
  foot.replaceChildren();

  const sum = { kcal: 0, p: 0, c: 0, x: 0, f: 0, net: 0 };
  for (const day of days) {
    const net = maintenance - day.kcal;
    const blank = day.kcal === 0;
    if (!blank) {
      sum.kcal += day.kcal;
      sum.p += day.p;
      sum.c += day.c;
      sum.x += day.x;
      sum.f += day.f;
      sum.net += net;
    }

    const d = dateFromKey(day.key);
    const name =
      day.key === todayKey() ? "Today" : `${DAY[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;

    const tr = document.createElement("tr");
    tr.append(
      cell(name),
      cell(blank ? "—" : fmt(day.kcal), blank ? "dim" : ""),
      cell(blank ? "—" : g1(day.p), "dim"),
      cell(blank ? "—" : g1(day.c), "dim"),
      cell(blank ? "—" : g1(day.x), "dim"),
      cell(blank ? "—" : g1(day.f), "dim"),
      cell(
        blank ? "—" : (net >= 0 ? "−" : "+") + fmt(Math.abs(net)),
        blank ? "dim" : net >= 0 ? "is-deficit" : "is-surplus",
      ),
    );
    body.append(tr);
  }

  const totalRow = document.createElement("tr");
  totalRow.append(
    cell(`${logged.length} day${logged.length === 1 ? "" : "s"}`),
    cell(fmt(sum.kcal)),
    cell(g1(sum.p), "dim"),
    cell(g1(sum.c), "dim"),
    cell(g1(sum.x), "dim"),
    cell(g1(sum.f), "dim"),
    cell(
      (sum.net >= 0 ? "−" : "+") + fmt(Math.abs(sum.net)),
      sum.net >= 0 ? "is-deficit" : "is-surplus",
    ),
  );
  foot.append(totalRow);

  const lbs = Math.abs(sum.net) / 3500;
  $("weekNote").textContent = logged.length
    ? `Across ${logged.length} logged day${logged.length === 1 ? "" : "s"} you ran a net ` +
      `${sum.net >= 0 ? "deficit" : "surplus"} of ${fmt(Math.abs(sum.net))} kcal — roughly ` +
      `${lbs.toFixed(2)} lb ${sum.net >= 0 ? "lost" : "gained"}.`
    : "Log a day to start the weekly balance.";
}

/* ===================== boot ===================== */

$("entryDate").value = todayKey();
$("entryDate").max = todayKey();
$("maintenance").value = state.maintenance;
renderPreview();
useBackend(new LocalBackend());
startAuth();
