/**
 * Firebase project settings.
 *
 * Replace the placeholder values below with the config object from your own
 * Firebase project (Project settings → General → Your apps → Web app → SDK
 * setup and configuration → Config). See README.md for the full walkthrough.
 *
 * These values are NOT secrets. A Firebase web config identifies your project
 * to Google's servers and is visible to anyone who loads the page — that is by
 * design. What protects your data is the Firestore security rules in
 * firestore.rules, which only let a signed-in user touch their own documents.
 *
 * Until you fill this in, the app still works: it keeps your log in this
 * browser's local storage and hides the sign-in button.
 */
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
