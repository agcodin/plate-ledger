/**
 * Lazy Firebase bootstrap.
 *
 * The SDK is only fetched once firebase-config.js holds real values, so an
 * unconfigured copy of the site loads nothing from Google and runs entirely
 * on local storage.
 */
import { firebaseConfig } from "../firebase-config.js";

const SDK_VERSION = "10.12.2";
const CDN = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;

let handle = null;

/** True once firebase-config.js has been filled in with a real project. */
export function isConfigured() {
  const key = firebaseConfig?.apiKey;
  return Boolean(key) && !key.startsWith("PASTE_");
}

/** Load the SDK and initialise the app. Resolves the same handle every time. */
export async function loadFirebase() {
  if (handle) return handle;
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-auth.js`),
    import(`${CDN}/firebase-firestore.js`),
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  handle = {
    app,
    auth: authMod.getAuth(app),
    db: fsMod.getFirestore(app),
    authMod,
    fs: fsMod,
  };
  return handle;
}

/**
 * Call `cb(user)` now and on every sign-in or sign-out. `user` is null when
 * nobody is signed in.
 */
export async function watchUser(cb) {
  const { auth, authMod } = await loadFirebase();
  return authMod.onAuthStateChanged(auth, cb);
}

/**
 * Sign in with Google. Uses a popup, falling back to a full-page redirect
 * where the browser blocks popups (common on iOS Safari and in-app browsers).
 */
export async function signIn() {
  const { auth, authMod } = await loadFirebase();
  const provider = new authMod.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await authMod.signInWithPopup(auth, provider);
  } catch (err) {
    const fallback = [
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
    ];
    if (fallback.includes(err?.code)) {
      await authMod.signInWithRedirect(auth, provider);
      return;
    }
    throw err;
  }
}

export async function signOutNow() {
  const { auth, authMod } = await loadFirebase();
  await authMod.signOut(auth);
}
