import {
  initializeApp,
  cert,
  getApps,
  type ServiceAccount,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

// ---------------------------------------------------------------------------
// Firebase Admin SDK — Server-only
// ---------------------------------------------------------------------------
// This file MUST NEVER be imported from a Client Component or the browser.
//
// Next.js guarantees this via `serverExternalPackages` in next.config.ts and
// the fact that `firebase-admin` requires Node.js built-ins.
//
// Environment variables here are deliberately NOT prefixed with NEXT_PUBLIC_.
// ---------------------------------------------------------------------------

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[Sand Diamonds] Missing Firebase Admin credentials. " +
        "Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and " +
        "FIREBASE_PRIVATE_KEY are set in .env.local."
    );
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    // Vercel/Render store private keys with escaped newlines — unescape them
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminApp = getAdminApp();

/** Firestore Admin — for Cloud Functions & API Routes */
export const adminDb: Firestore = getFirestore(adminApp);

/** Auth Admin — for verifying ID tokens in API Routes */
export const adminAuth: Auth = getAuth(adminApp);

export { adminApp };
