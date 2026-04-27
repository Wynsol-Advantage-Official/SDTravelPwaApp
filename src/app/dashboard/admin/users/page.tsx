"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import {
  Users,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Pencil,
  Ban,
  CheckCircle2,
  X,
  Loader2,
  ChevronDown,
  RefreshCw,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  disabled: boolean
  emailVerified: boolean
  providerIds: string[]
  createdAt: string | null
  lastSignIn: string | null
  customClaims: Record<string, unknown>
  tenantName?: string | null
}

type UserRole = "user" | "tenant_admin" | "super_admin"

const AVATAR_PLACEHOLDER_SRC = "/logos/brand/Iconset-06.png"

const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  tenant_admin: "Tenant Admin",
  super_admin: "Super Admin",
}

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  tenant_admin: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  super_admin: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  user: <Shield className="h-3 w-3" />,
  tenant_admin: <ShieldCheck className="h-3 w-3" />,
  super_admin: <ShieldAlert className="h-3 w-3" />,
}

function UserAvatar({
  photoURL,
  fallbackLetter,
}: {
  photoURL: string | null
  fallbackLetter: string
}) {
  const [avatarSrc, setAvatarSrc] = useState(photoURL ?? AVATAR_PLACEHOLDER_SRC)

  useEffect(() => {
    setAvatarSrc(photoURL ?? AVATAR_PLACEHOLDER_SRC)
  }, [photoURL])

  return (
    <img
      src={avatarSrc}
      alt={fallbackLetter}
      loading="lazy"
      onError={() => {
        if (avatarSrc !== AVATAR_PLACEHOLDER_SRC) {
          setAvatarSrc(AVATAR_PLACEHOLDER_SRC)
        }
      }}
      className="h-8 w-8 rounded-full object-cover"
    />
  )
}

// ---------------------------------------------------------------------------
// Page wrapper (uses AuthGuard to enforce super_admin)
// ---------------------------------------------------------------------------
export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="super_admin">
      <UserManagementPortal />
    </AuthGuard>
  )
}

// ---------------------------------------------------------------------------
// Main portal component
// ---------------------------------------------------------------------------
function UserManagementPortal() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [pageToken, setPageToken] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle"
    user: AdminUser
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // ── Fetch users ─────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users?limit=100")
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setUsers(data.users)
      setPageToken(data.pageToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Filtered users (client-side search) ─────────────────────────────
  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q) ||
      ((u.customClaims.role as string) ?? "user").includes(q) ||
      ((u.customClaims.tenantId as string) ?? "").includes(q)
    )
  })

  // ── Delete user ─────────────────────────────────────────────────────
  const handleDelete = async (uid: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${uid}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setUsers((prev) => prev.filter((u) => u.uid !== uid))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  // ── Toggle disable/enable ───────────────────────────────────────────
  const handleToggleDisable = async (user: AdminUser) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !user.disabled }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const updated = await res.json()
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, disabled: updated.disabled } : u)),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed")
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  // ── Rendered ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ocean-deep dark:text-tan-100">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            Manage all platform users, roles, and tenant assignments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 rounded-md border border-ocean-deep/20 px-3 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/40 dark:text-tan-100/40" />
        <input
          type="text"
          placeholder="Search by email, name, UID, role, or tenant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-ocean-deep/20 bg-white py-2.5 pl-10 pr-4 text-sm text-ocean-deep placeholder-ocean-deep/40 transition-colors focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean dark:border-tan-100/20 dark:bg-luxury-base dark:text-tan-100 dark:placeholder-tan-100/40"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-ocean" />
        </div>
      )}

      {/* Users table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg border border-ocean-deep/10 bg-white shadow-sm dark:border-tan-100/10 dark:bg-luxury-base">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ocean-deep/10 bg-ocean-deep/5 text-xs uppercase tracking-wider text-ocean-deep/70 dark:border-tan-100/10 dark:bg-tan-100/5 dark:text-tan-100/70">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Sign In</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-deep/10 dark:divide-tan-100/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-ocean-deep/50 dark:text-tan-100/50"
                    >
                      {search ? "No users match your search" : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const role = (u.customClaims.role as UserRole) ?? "user"
                    const tenantId = u.customClaims.tenantId as string | undefined
                    const isSelf = u.uid === currentUser?.uid

                    return (
                      <tr
                        key={u.uid}
                        className="transition-colors hover:bg-ocean-deep/2 dark:hover:bg-tan-100/2"
                      >
                        {/* User info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              photoURL={u.photoURL}
                              fallbackLetter={(u.displayName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                            />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-ocean-deep dark:text-tan-100">
                                {u.displayName || "—"}
                                {isSelf && (
                                  <span className="ml-1.5 text-xs text-ocean/60">(you)</span>
                                )}
                              </div>
                              <div className="truncate text-xs text-ocean-deep/50 dark:text-tan-100/50">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role badge */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}
                          >
                            {ROLE_ICONS[role]}
                            {ROLE_LABELS[role]}
                          </span>
                        </td>

                        {/* Tenant */}
                        <td className="px-4 py-3 text-ocean-deep/70 dark:text-tan-100/70">
                          {u.tenantName ?? tenantId ?? "—"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {u.disabled ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                              <Ban className="h-3 w-3" /> Disabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          )}
                        </td>

                        {/* Last sign in */}
                        <td className="px-4 py-3 text-xs text-ocean-deep/60 dark:text-tan-100/60">
                          {u.lastSignIn ? formatDate(u.lastSignIn) : "Never"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingUser(u)}
                              title="Edit user"
                              className="rounded p-1.5 text-ocean-deep/50 transition-colors hover:bg-ocean-deep/10 hover:text-ocean-deep dark:text-tan-100/50 dark:hover:bg-tan-100/10 dark:hover:text-tan-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "toggle", user: u })
                              }
                              title={u.disabled ? "Enable account" : "Disable account"}
                              disabled={isSelf}
                              className="rounded p-1.5 text-ocean-deep/50 transition-colors hover:bg-ocean-deep/10 hover:text-ocean-deep disabled:cursor-not-allowed disabled:opacity-30 dark:text-tan-100/50 dark:hover:bg-tan-100/10 dark:hover:text-tan-100"
                            >
                              {u.disabled ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "delete", user: u })
                              }
                              title="Delete user"
                              disabled={isSelf}
                              className="rounded p-1.5 text-red-500/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* User count */}
          <p className="text-xs text-ocean-deep/50 dark:text-tan-100/50">
            Showing {filteredUsers.length} of {users.length} user{users.length !== 1 && "s"}
          </p>
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev])
            setShowCreateModal(false)
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isSelf={editingUser.uid === currentUser?.uid}
          onClose={() => setEditingUser(null)}
          onUpdated={(updated) => {
            setUsers((prev) =>
              prev.map((u) =>
                u.uid === updated.uid
                  ? {
                      ...u,
                      displayName: updated.displayName,
                      disabled: updated.disabled,
                      customClaims: updated.customClaims,
                    }
                  : u,
              ),
            )
            setEditingUser(null)
          }}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          loading={actionLoading}
          title={
            confirmAction.type === "delete"
              ? "Delete User"
              : confirmAction.user.disabled
                ? "Enable User"
                : "Disable User"
          }
          message={
            confirmAction.type === "delete"
              ? `Are you sure you want to permanently delete ${confirmAction.user.email ?? confirmAction.user.uid}? This cannot be undone.`
              : confirmAction.user.disabled
                ? `Re-enable access for ${confirmAction.user.email ?? confirmAction.user.uid}?`
                : `Disable ${confirmAction.user.email ?? confirmAction.user.uid}? They will be unable to sign in.`
          }
          confirmLabel={
            confirmAction.type === "delete"
              ? "Delete"
              : confirmAction.user.disabled
                ? "Enable"
                : "Disable"
          }
          danger={confirmAction.type === "delete" || !confirmAction.user.disabled}
          onConfirm={() =>
            confirmAction.type === "delete"
              ? handleDelete(confirmAction.user.uid)
              : handleToggleDisable(confirmAction.user)
          }
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create User Modal
// ---------------------------------------------------------------------------
function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (user: AdminUser) => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<UserRole>("user")
  const [tenantId, setTenantId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || undefined,
          role,
          tenantId: tenantId || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      onCreated({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName ?? null,
        photoURL: null,
        disabled: false,
        emailVerified: false,
        providerIds: ["password"],
        createdAt: new Date().toISOString(),
        lastSignIn: null,
        customClaims: data.customClaims ?? {},
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-bold text-ocean-deep dark:text-tan-100">
          Create New User
        </h2>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <FieldGroup label="Email" required>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="user@example.com"
          />
        </FieldGroup>

        <FieldGroup label="Password" required>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Minimum 6 characters"
          />
        </FieldGroup>

        <FieldGroup label="Display Name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            placeholder="Full name"
          />
        </FieldGroup>

        <FieldGroup label="Role">
          <RoleSelect value={role} onChange={setRole} />
        </FieldGroup>

        {role !== "super_admin" && (
          <FieldGroup label="Tenant ID" hint="Leave empty for the primary domain (www)">
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value.toLowerCase().trim())}
              className="input-field"
              placeholder="e.g. solnica"
            />
          </FieldGroup>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create User
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ---------------------------------------------------------------------------
// Edit User Modal
// ---------------------------------------------------------------------------
function EditUserModal({
  user,
  isSelf,
  onClose,
  onUpdated,
}: {
  user: AdminUser
  isSelf: boolean
  onClose: () => void
  onUpdated: (data: {
    uid: string
    displayName: string | null
    disabled: boolean
    customClaims: Record<string, unknown>
  }) => void
}) {
  const currentRole = (user.customClaims.role as UserRole) ?? "user"
  const currentTenant = (user.customClaims.tenantId as string) ?? ""

  const [displayName, setDisplayName] = useState(user.displayName ?? "")
  const [role, setRole] = useState<UserRole>(currentRole)
  const [tenantId, setTenantId] = useState(currentTenant)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {}
      if (displayName !== (user.displayName ?? "")) body.displayName = displayName
      if (role !== currentRole) body.role = role
      if (tenantId !== currentTenant) body.tenantId = tenantId || null

      const res = await fetch(`/api/admin/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const updated = await res.json()
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-bold text-ocean-deep dark:text-tan-100">
          Edit User
        </h2>
        <p className="text-xs text-ocean-deep/50 dark:text-tan-100/50">
          UID: {user.uid}
        </p>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <FieldGroup label="Display Name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
          />
        </FieldGroup>

        <FieldGroup label="Role">
          <RoleSelect
            value={role}
            onChange={setRole}
            disableSuperAdmin={isSelf}
          />
          {isSelf && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              You cannot change your own role
            </p>
          )}
        </FieldGroup>

        {role !== "super_admin" && (
          <FieldGroup label="Tenant ID" hint="Leave empty for primary domain (www)">
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value.toLowerCase().trim())}
              className="input-field"
              placeholder="e.g. solnica"
            />
          </FieldGroup>
        )}

        {/* Read-only info */}
        <div className="space-y-1 rounded-md bg-ocean-deep/5 p-3 text-xs text-ocean-deep/60 dark:bg-tan-100/5 dark:text-tan-100/60">
          <div>Email: {user.email ?? "—"}</div>
          <div>Providers: {user.providerIds.join(", ") || "—"}</div>
          <div>Created: {user.createdAt ? formatDate(user.createdAt) : "—"}</div>
          <div>Last sign-in: {user.lastSignIn ? formatDate(user.lastSignIn) : "Never"}</div>
          <div>Email verified: {user.emailVerified ? "Yes" : "No"}</div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalOverlay>
  )
}

// ---------------------------------------------------------------------------
// Confirmation Dialog
// ---------------------------------------------------------------------------
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  danger: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ocean-deep dark:text-tan-100">{title}</h2>
        <p className="text-sm text-ocean-deep/70 dark:text-tan-100/70">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-luxury-base">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-ocean-deep/40 hover:text-ocean-deep dark:text-tan-100/40 dark:hover:text-tan-100"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

function FieldGroup({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-0.5 block text-xs text-ocean-deep/50 dark:text-tan-100/50">
          {hint}
        </span>
      )}
    </label>
  )
}

function RoleSelect({
  value,
  onChange,
  disableSuperAdmin,
}: {
  value: UserRole
  onChange: (v: UserRole) => void
  disableSuperAdmin?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        className="input-field appearance-none pr-8"
      >
        <option value="user">User</option>
        <option value="tenant_admin">Tenant Admin</option>
        <option value="super_admin" disabled={disableSuperAdmin}>
          Super Admin
        </option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/40 dark:text-tan-100/40" />
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}
