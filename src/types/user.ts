// ---------------------------------------------------------------------------
// User & Dashboard Interfaces — maps to Firestore `users/` collection
// ---------------------------------------------------------------------------

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteDestinations?: string[];
  travelStyle?: "adventure" | "relaxation" | "cultural" | "romantic";
  budgetRange?: "luxury" | "ultra-luxury" | "no-limit";
}

export interface SavedDiamond {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  heroImageSrc: string;
  savedAt: Date;
  notes?: string;
}
