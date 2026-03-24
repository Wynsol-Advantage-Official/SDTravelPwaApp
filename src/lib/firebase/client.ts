import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// ---------------------------------------------------------------------------
// Firebase Client SDK — Browser-safe initialization
// ---------------------------------------------------------------------------
// All keys prefixed NEXT_PUBLIC_ are safe to ship to the browser.
// Security is enforced by Firestore rules + Firebase Auth, NOT by hiding keys.
// ---------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// Auth instance — used by useAuth() hook
export const auth: Auth = getAuth(app);

// Firestore with offline persistence for concierge chat resilience
export const db: Firestore =
  getApps().length === 1 && typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    : getFirestore(app);

// Analytics — browser-only, initialised lazily so SSR never breaks.
// Usage: const analytics = await getFirebaseAnalytics()
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getAnalytics(app);
}

export { app };
