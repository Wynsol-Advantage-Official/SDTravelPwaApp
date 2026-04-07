import type { UserProfile, UserPreferences } from "@/types/user"

// ---------------------------------------------------------------------------
// Mock User — simulates a logged-in Firebase user
// ---------------------------------------------------------------------------

export const mockUser = {
  uid: "mock-uid-sd-001",
  email: "diamond.traveler@sanddiamonds.com",
  displayName: "Sophia Laurent",
  photoURL: "https://api.dicebear.com/9.x/initials/svg?seed=SL&backgroundColor=C2A978&textColor=1A1A2E",
  emailVerified: true,
} as const

export const mockUserProfile: UserProfile = {
  uid: mockUser.uid,
  displayName: mockUser.displayName,
  email: mockUser.email,
  phone: "+1 (555) 234-5678",
  tenantId: null,
  avatar: mockUser.photoURL,
  preferences: {
    favoriteDestinations: ["Caribbean", "Mediterranean", "East Africa"],
    travelStyle: "luxury" as UserPreferences["travelStyle"],
    budgetRange: "ultra-luxury" as UserPreferences["budgetRange"],
  } as UserPreferences,
  createdAt: new Date("2025-09-15T10:00:00Z"),
  updatedAt: new Date("2026-03-10T14:30:00Z"),
}
