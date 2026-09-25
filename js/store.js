/**
 * Persistence.
 *
 * Two backends behind one interface. LocalBackend keeps the ledger in this
 * browser; CloudBackend keeps it under users/{uid} in Firestore so it follows
 * the signed-in account across devices. The app swaps between them on
 * sign-in and sign-out and never has to care which one is live.
 *
 * Every backend calls its subscriber with the whole shape
 * `{entries, settings, customFoods}` whenever any part of it changes.
 */

const KEYS = {
  entries: "pl.entries",
  settings: "pl.settings",
  custom: "pl.customFoods",
};

/** Local storage that never throws — private windows and blocked site data. */
export const ls = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or blocked storage — the session still works in memory */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export class LocalBackend {
  constructor() {
    this.mode = "local";
    this.onChange = null;
  }

  subscribe(onChange) {
    this.onChange = onChange;
    this.#emit();
    return () => {
      this.onChange = null;
    };
  }

  snapshot() {
    return {
      entries: ls.read(KEYS.entries, []),
      settings: ls.read(KEYS.settings, {}),
      customFoods: ls.read(KEYS.custom, []),
    };
  }

  #emit() {
    if (this.onChange) this.onChange(this.snapshot());
  }

  async addEntry(entry) {
    const entries = ls.read(KEYS.entries, []);
    entries.push(entry);
    ls.write(KEYS.entries, entries);
    this.#emit();
  }

  async removeEntry(id) {
    const entries = ls.read(KEYS.entries, []).filter((e) => e.id !== id);
    ls.write(KEYS.entries, entries);
    this.#emit();
  }

  async setMaintenance(kcal) {
    await this.setSetting("maintenance", kcal);
  }

  async setSetting(field, value) {
    const settings = ls.read(KEYS.settings, {});
    settings[field] = value;
    ls.write(KEYS.settings, settings);
    this.#emit();
  }

  async addCustomFood(food) {
    const foods = ls.read(KEYS.custom, []).filter((f) => f.name !== food.name);
    foods.push(food);
    ls.write(KEYS.custom, foods);
    this.#emit();
  }

  clearEntries() {
    ls.remove(KEYS.entries);
    this.#emit();
  }
}

/** How far back the cloud backend reads. Older entries stay stored, unread. */
const HISTORY_DAYS = 400;

export class CloudBackend {
  /**
   * @param {object} fs   the firebase-firestore module namespace
   * @param {object} db   a Firestore instance
   * @param {string} uid  the signed-in user's id
   */
  constructor(fs, db, uid) {
    this.mode = "cloud";
    this.fs = fs;
    this.db = db;
    this.uid = uid;
    this.entriesCol = fs.collection(db, "users", uid, "entries");
    this.customCol = fs.collection(db, "users", uid, "customFoods");
    this.settingsDoc = fs.doc(db, "users", uid, "meta", "settings");
    this.cache = { entries: [], settings: {}, customFoods: [] };
    this.unsubs = [];
    this.onChange = null;
    this.onError = null;
  }

  subscribe(onChange, onError) {
    this.onChange = onChange;
    this.onError = onError;
    const fs = this.fs;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - HISTORY_DAYS);
    const since = cutoff.toISOString().slice(0, 10);

    const fail = (err) => {
      if (this.onError) this.onError(err);
    };

    this.unsubs.push(
      fs.onSnapshot(
        fs.query(this.entriesCol, fs.where("date", ">=", since)),
        (snap) => {
          this.cache.entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          this.#emit();
        },
        fail,
      ),
    );

    this.unsubs.push(
      fs.onSnapshot(
        this.settingsDoc,
        (snap) => {
          this.cache.settings = snap.exists() ? snap.data() : {};
          this.#emit();
        },
        fail,
      ),
    );

    this.unsubs.push(
      fs.onSnapshot(
        this.customCol,
        (snap) => {
          this.cache.customFoods = snap.docs.map((d) => d.data());
          this.#emit();
        },
        fail,
      ),
    );

    return () => this.dispose();
  }

  dispose() {
    this.unsubs.forEach((u) => {
      try {
        u();
      } catch {
        /* already torn down */
      }
    });
    this.unsubs = [];
    this.onChange = null;
  }

  #emit() {
    if (this.onChange) this.onChange({ ...this.cache });
  }

  async addEntry(entry) {
    const { id, ...body } = entry;
    await this.fs.setDoc(this.fs.doc(this.entriesCol, id), body);
  }

  async removeEntry(id) {
    await this.fs.deleteDoc(this.fs.doc(this.entriesCol, id));
  }

  async setMaintenance(kcal) {
    await this.setSetting("maintenance", kcal);
  }

  async setSetting(field, value) {
    await this.fs.setDoc(this.settingsDoc, { [field]: value }, { merge: true });
  }

  async addCustomFood(food) {
    await this.fs.setDoc(this.fs.doc(this.customCol, slugify(food.name)), food);
  }

  /** Copy entries logged while signed out into this account. */
  async importEntries(entries) {
    const fs = this.fs;
    for (let i = 0; i < entries.length; i += 400) {
      const batch = fs.writeBatch(this.db);
      for (const entry of entries.slice(i, i + 400)) {
        const { id, ...body } = entry;
        batch.set(fs.doc(this.entriesCol, id), body);
      }
      await batch.commit();
    }
  }
}

export function slugify(name) {
  return (
    "c" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").slice(0, 80)
  );
}
