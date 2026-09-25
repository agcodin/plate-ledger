# Plate Ledger

A calorie and macro tracker for people who eat Indian food. Log what you ate and
how much of it, and it works out calories, protein, carbohydrate, fat and fiber;
set your maintenance calories and it shows the deficit or surplus you're running,
today and across the past week.

**Live:** https://agcodin.github.io/plate-ledger/

No build step, no framework, no bundler — plain ES modules served as static
files. Firebase is loaded lazily from a CDN and only when it is configured.

## What's in it

- **349 foods**, weighted toward Indian and especially South Indian cooking:
  idli, the dosa family, pesarattu, adai, uttapam, appam, idiyappam, puttu,
  Kerala parotta, medu vada, upma, the pongals, bisi bele bath, the rice
  dishes, sambar, rasam, mor and vatha kuzhambu, avial, poriyal, kootu, thoran,
  Chettinad chicken, Malabar fish curry, fish moilee, chicken 65, the chutneys
  and podi — plus the North Indian and pan-Indian staples, dals and flours, and
  a general Western set.
- **71 vegetables and 47 fruits** listed individually, including the Indian
  ones: karela, lauki, turai, tindora, parwal, ash gourd, snake gourd, arbi,
  suran, methi, moringa and amaranth leaves, curry leaves, moong sprouts,
  cluster beans, drumstick — and amla, jamun, sitaphal, chikoo, mosambi,
  jackfruit, lychee, guava.
- **Real serving units** per food — *per idli*, *per dosa*, *cup of sambar*,
  *ladle*, *tbsp of chutney*, *plate of biryani*, *tumbler of filter coffee* —
  alongside grams and ounces.
- **Nutrition-label day panel** with macro shares of the day's calories
  (4 kcal/g for protein and carbs, 9 kcal/g for fat) and fiber against the
  28 g Daily Value.
- **Net balance** against your maintenance calories, converted to lb/week at
  the conventional 3,500 kcal per pound.
- **Past 7 days** — bar chart with a maintenance line, and a table of
  kcal / protein / carbs / fat / fiber / net per day with a weekly total.
- **Gemini lookup** — type something the table doesn't have and it asks Gemini
  for per-100 g values and a household serving, fills them in, saves the food
  and selects it. Answers come back under a response schema and are re-checked
  in the browser (fiber can't exceed carbs, nothing over 100 g or 902 kcal per
  100 g, calories sanity-checked against the macros) before anything is saved.
- **Custom foods** — or add anything by hand from its per-100 g values.
- **Google sign-in** — your log syncs to your account and follows you across
  devices. Signed out, everything still works and stays in this browser.

## Running it locally

ES modules need a real server; opening `index.html` from the filesystem won't
work. Anything static will do:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Firebase

Already set up. Project **`plate-ledger-7f3a`** — Firestore is provisioned, the
security rules below are deployed, and the web config is in
[`firebase-config.js`](./firebase-config.js).

Console: https://console.firebase.google.com/project/plate-ledger-7f3a

Rules are redeployed with:

```bash
firebase deploy --only firestore:rules
```

<details>
<summary>How it was set up, if it ever needs rebuilding</summary>

1. **Create the project.** Go to https://console.firebase.google.com, click
   *Add project*, name it (e.g. `plate-ledger`), and skip Google Analytics.

2. **Turn on Google sign-in.** In the left sidebar: *Build → Authentication →
   Get started → Sign-in method → Google → Enable*. Pick a support email and
   save.

3. **Authorise the site's domain.** Still in Authentication, go to *Settings →
   Authorized domains → Add domain* and add `agcodin.github.io`. Without this
   the sign-in popup opens and immediately fails with
   `auth/unauthorized-domain`. (`localhost` is already authorised, so local
   development works out of the box.)

4. **Create the database.** *Build → Firestore Database → Create database*.
   Choose a region near you and start in **production mode** — the rules in
   step 5 replace the defaults.

5. **Publish the security rules.** Open the *Rules* tab and replace what's
   there with the contents of [`firestore.rules`](./firestore.rules), then
   *Publish*. These rules are what actually protect your data: they allow reads
   and writes only under `users/{your uid}`, so nobody can read anyone else's
   log.

6. **Register a web app and copy the config.** *Project settings* (the gear
   icon) *→ General →* scroll to *Your apps →* click the web icon `</>` →
   give it a nickname → *Register app*. Firebase shows a `firebaseConfig`
   object. Copy its values into [`firebase-config.js`](./firebase-config.js),
   replacing the `PASTE_...` placeholders.

7. **Commit and push.** GitHub Pages redeploys in about a minute, and the
   *Sign in with Google* button appears.

</details>

### About committing the Firebase config

Firebase web config values are **not secrets** — they identify your project to
Google and are visible to anyone who loads any Firebase web app. Google
documents them as public. Your data is protected by the Firestore rules in step
5, not by hiding the API key. If you want to narrow it further, add an HTTP
referrer restriction to the browser key in Google Cloud console → APIs &
Services → Credentials.

## How data is stored

| Signed in | Where |
| --- | --- |
| No | `localStorage` in this browser |
| Yes | Firestore, under `users/{uid}` |

```
users/{uid}/entries/{entryId}     one logged food
users/{uid}/customFoods/{slug}    foods you added yourself
users/{uid}/meta/settings         { maintenance: number }
```

Sign in while you have entries logged locally and the app offers to copy them
into your account rather than doing it silently. Entries are read back 400 days
at a time; anything older stays stored but isn't fetched on load.

## Files

```
index.html          markup
styles.css          all styling, light and dark themes as CSS tokens
firebase-config.js  the one file you edit — your project's settings
firestore.rules     security rules to paste into the Firebase console
js/foods.js         the nutrition table and the search ranking
js/firebase.js      lazy SDK load, Google sign-in, auth state
js/gemini.js        nutrition lookup for foods not in the table
js/store.js         LocalBackend and CloudBackend behind one interface
js/app.js           state, rendering, event wiring
```

## The Gemini API key

The key is **not in this repo and must never be**. This is a public repo serving
a static page, so anything committed here is readable by anyone who opens the
site — and unlike the Firebase web config (public by design, guarded by the
Firestore rules), a Gemini key is a live billable credential with nothing behind
it.

Instead the key is entered once in the app, under **AI key** in the header, and
stored per user:

| Signed in | Where the key lives |
| --- | --- |
| Yes | `users/{uid}/meta/settings.geminiKey` — only you can read it, per the rules |
| No | `localStorage` on that device |

It is sent to Google in an `x-goog-api-key` header rather than a query string,
so it stays out of URLs and referrer logs.

Get a key at https://aistudio.google.com/apikey. Two things worth doing to it in
Google Cloud console → APIs & Services → Credentials:

- **Restrict it to the Generative Language API**, so a leak can't touch anything
  else in the project.
- **Add an HTTP referrer restriction** for `agcodin.github.io/*`.

Use a key dedicated to this app rather than one shared with another project — a
shared key means one leak burns both.

## A note on the numbers

Indian and South Indian dishes are entered as they are normally cooked at home —
sambar with its usual tempering, dosa off a greased tawa, curries with their
oil — so a restaurant version will run richer. These are reference figures,
close enough to steer a deficit, not a lab assay. Weight-change estimates use
the conventional 3,500 kcal per pound of body fat, which is a rule of thumb, not
a law of physics.

Not medical advice.
