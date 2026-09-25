/**
 * Nutrition lookup via the Gemini API.
 *
 * Used when someone types a food the table doesn't have. Gemini is asked for
 * per-100 g values plus one household serving, and answers under a response
 * schema so the reply is always parseable JSON rather than prose.
 *
 * THE KEY IS NEVER IN THIS REPO. It is entered once in the app and kept in the
 * signed-in user's own Firestore document (or localStorage when signed out),
 * so it is not served to anyone who loads the page. See README.
 */

const MODEL = "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Gemini's structured-output schema — every field required, all numeric. */
const SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING", description: "the food, lowercase, as it would be listed" },
    kcal: { type: "NUMBER", description: "calories per 100 g" },
    protein: { type: "NUMBER", description: "grams of protein per 100 g" },
    carbs: { type: "NUMBER", description: "grams of total carbohydrate per 100 g, including fiber" },
    fiber: { type: "NUMBER", description: "grams of dietary fiber per 100 g, never more than carbs" },
    fat: { type: "NUMBER", description: "grams of fat per 100 g" },
    serving_label: { type: "STRING", description: "one household serving, e.g. bowl, piece, cup, plate" },
    serving_grams: { type: "NUMBER", description: "grams in that serving" },
    confident: { type: "BOOLEAN", description: "false if this is not a recognisable food" },
  },
  required: [
    "name", "kcal", "protein", "carbs", "fiber", "fat",
    "serving_label", "serving_grams", "confident",
  ],
};

function buildPrompt(query) {
  return [
    "You are a nutrition reference for a calorie tracker used mainly for Indian and",
    "South Indian home cooking.",
    "",
    `Give typical values for: "${query}"`,
    "",
    "Rules:",
    "- All macro values are PER 100 GRAMS of the food as eaten, not per serving.",
    "- Assume it is cooked the normal way at home, with the oil, ghee or tempering",
    "  that normally goes into it. Do not give a diet version.",
    "- carbs is TOTAL carbohydrate and includes fiber, so fiber must never exceed it.",
    "- kcal should roughly equal protein*4 + carbs*4 + fat*9, within about 15%,",
    "  unless the food contains alcohol.",
    "- serving_label is how a person would actually order or serve it — bowl, piece,",
    "  cup, plate, glass, roti — and serving_grams is that serving's weight.",
    "- If this is not a food at all, set confident to false and return zeros.",
  ].join("\n");
}

/** Thrown with a `code` the UI can branch on. */
export class GeminiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * Ask Gemini for a food's nutrition.
 * @returns {Promise<object>} {name, kcal, protein, carbs, fiber, fat, serving_label, serving_grams}
 */
export async function lookupFood(query, apiKey, { signal } = {}) {
  if (!apiKey) throw new GeminiError("no_key", "No API key set.");

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        // Header rather than ?key= so the key stays out of URLs and referrer logs.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(query) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          temperature: 0.2,
        },
      }),
    });
  } catch (err) {
    if (err?.name === "AbortError") throw new GeminiError("cancelled", "Cancelled.");
    throw new GeminiError("network", "Couldn't reach Gemini.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message || "";
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 400 && /API key not valid/i.test(detail)) {
      throw new GeminiError("bad_key", "That API key was rejected.");
    }
    if (res.status === 403) {
      throw new GeminiError(
        "forbidden",
        "The key was refused — check its API restrictions and HTTP referrer list.",
      );
    }
    if (res.status === 429) throw new GeminiError("rate_limited", "Rate limited — try again shortly.");
    throw new GeminiError("http_" + res.status, detail || `Gemini returned ${res.status}.`);
  }

  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new GeminiError("empty", "Gemini returned nothing usable.");

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new GeminiError("bad_json", "Gemini's answer wasn't valid JSON.");
  }

  return normalise(data, query);
}

/**
 * Coerce and sanity-check what came back. A model can still return a value that
 * breaks its own schema's intent, so the arithmetic is re-checked here.
 */
function normalise(data, query) {
  if (data.confident === false) {
    throw new GeminiError("not_a_food", `Gemini didn't recognise “${query}” as a food.`);
  }

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const out = {
    name: String(data.name || query).trim().toLowerCase().slice(0, 80),
    kcal: num(data.kcal),
    protein: num(data.protein),
    carbs: num(data.carbs),
    fiber: num(data.fiber),
    fat: num(data.fat),
    servingLabel: String(data.serving_label || "").trim().slice(0, 24),
    servingGrams: num(data.serving_grams),
  };

  // Fiber is a subset of carbohydrate; a model sometimes reports it separately.
  if (out.fiber > out.carbs) out.carbs = out.fiber;

  // Per 100 g, nothing can exceed 100 g of anything or ~900 kcal (pure fat).
  if (out.protein > 100 || out.carbs > 100 || out.fat > 100 || out.kcal > 902) {
    throw new GeminiError("implausible", "Gemini's numbers didn't make sense — add it manually.");
  }

  const atwater = out.protein * 4 + out.carbs * 4 + out.fat * 9;
  out.mismatch = out.kcal > 20 && Math.abs(atwater - out.kcal) > Math.max(60, out.kcal * 0.45);

  if (!(out.servingGrams > 0) || !out.servingLabel) {
    out.servingLabel = "";
    out.servingGrams = 0;
  }
  return out;
}
