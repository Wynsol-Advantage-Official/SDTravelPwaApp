import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./client"

/**
 * Create a new user and bootstrap their Firestore profile.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })

  await setDoc(doc(db, "users", user.uid, "profile", "main"), {
    displayName,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return user
}

/**
 * Sign in with email + password.
 */
export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

/**
 * Sign in with Google OAuth popup.
 */
export async function signInWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
  return user
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  await fbSignOut(auth)
}

/**
 * Ensure a Firestore profile doc exists for the user.
 * Called on every login / auth-state restore so that Google-sign-in users
 * and legacy accounts that pre-date the profile bootstrap are covered.
 * Uses setDoc with merge so existing fields are never overwritten.
 */
export async function ensureProfile(user: User): Promise<void> {
  const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")
  const { db } = await import("./client")

  const profileRef = doc(db, "users", user.uid, "profile", "main")
  const snap = await getDoc(profileRef)

  if (!snap.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName || user.email || "",
      email: user.email || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * Get the ID token for API route authorization.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
