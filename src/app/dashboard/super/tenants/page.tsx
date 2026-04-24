"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { AuthGuard } from "@/components/auth/AuthGuard"
import {
  TenantModalOverlay,
  type TenantRecord,
  type TenantBrandingDraft,
} from "@/components/dashboard/tenants"
import {
  Building2,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Globe,
  CheckCircle2,
  Pause,
  Clock,
  Plus,
} from "lucide-react"

const AddTenantWizardModal = dynamic(
  () =>
    import("@/components/dashboard/tenants").then(
      (module) => module.AddTenantWizardModal,
    ),
  { ssr: false, loading: () => null },
)

const STATUS_BADGE: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  active: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    label: "Active",
  },
  suspended: {
    icon: <Pause className="h-3 w-3" />,
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Suspended",
  },
  provisioning: {
    icon: <Clock className="h-3 w-3" />,
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Provisioning",
  },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SuperTenantsPage() {
  return (
    <AuthGuard requiredRole="super_admin">
      <TenantsPortal />
    </AuthGuard>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function TenantsPortal() {
  const [tenants, setTenants] = useState<TenantRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showAddTenantWizard, setShowAddTenantWizard] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<TenantRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTenants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/tenants")
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setTenants(data.tenants)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const filtered = tenants.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.tenantId.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      (t.wixSiteId ?? "").toLowerCase().includes(q)
    )
  })

  const handleDelete = async (tenantId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setTenants((prev) => prev.filter((t) => t.tenantId !== tenantId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setActionLoading(false)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ocean-deep dark:text-tan-100">
            <Building2 className="h-6 w-6" />
            Tenant Management
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            View and manage all tenant portals, site IDs, and access
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTenants}
            className="inline-flex items-center gap-1.5 rounded-md border border-ocean-deep/20 px-3 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddTenantWizard(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90"
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ocean-deep/40 dark:text-tan-100/40" />
        <input
          type="text"
          placeholder="Search by name, domain, tenant ID, or site ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-ocean" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg border border-ocean-deep/10 bg-white shadow-sm dark:border-tan-100/10 dark:bg-luxury-base">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ocean-deep/10 bg-ocean-deep/5 text-xs uppercase tracking-wider text-ocean-deep/70 dark:border-tan-100/10 dark:bg-tan-100/5 dark:text-tan-100/70">
                <tr>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Wix Site ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-deep/10 dark:divide-tan-100/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-ocean-deep/50 dark:text-tan-100/50">
                      {search ? "No tenants match your search" : "No tenants found"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const badge = STATUS_BADGE[t.status] ?? STATUS_BADGE.active
                    return (
                      <tr key={t.tenantId} className="transition-colors hover:bg-ocean-deep/2 dark:hover:bg-tan-100/2">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-ocean-deep dark:text-tan-100">
                              {t.name}
                            </div>
                            <div className="text-xs text-ocean-deep/50 dark:text-tan-100/50">
                              {t.tenantId}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-ocean-deep/70 dark:text-tan-100/70">
                            <Globe className="h-3 w-3" />
                            {t.domain}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ocean-deep/60 dark:text-tan-100/60">
                          {t.wixSiteId ? (
                            <span title={t.wixSiteId}>
                              {t.wixSiteId.length > 20
                                ? `${t.wixSiteId.slice(0, 20)}…`
                                : t.wixSiteId}
                            </span>
                          ) : (
                            <span className="text-red-400">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ocean-deep/60 dark:text-tan-100/60">
                          {t.createdAt ? formatDate(t.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingTenant(t)}
                              title="Edit tenant"
                              className="rounded p-1.5 text-ocean-deep/50 transition-colors hover:bg-ocean-deep/10 hover:text-ocean-deep dark:text-tan-100/50 dark:hover:bg-tan-100/10 dark:hover:text-tan-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(t)}
                              title="Delete tenant"
                              disabled={t.tenantId === "www"}
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

          <p className="text-xs text-ocean-deep/50 dark:text-tan-100/50">
            Showing {filtered.length} of {tenants.length} tenant{tenants.length !== 1 && "s"}
          </p>
        </>
      )}

      {/* Edit modal */}
      {showAddTenantWizard && (
        <AddTenantWizardModal
          onClose={() => setShowAddTenantWizard(false)}
          onCreated={async () => {
            await fetchTenants()
          }}
        />
      )}

      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onUpdated={(updated) => {
            setTenants((prev) =>
              prev.map((t) =>
                t.tenantId === updated.tenantId ? { ...t, ...updated } : t,
              ),
            )
            setEditingTenant(null)
          }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <TenantModalOverlay onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ocean-deep dark:text-tan-100">
              Delete Tenant
            </h2>
            <p className="text-sm text-ocean-deep/70 dark:text-tan-100/70">
              Are you sure you want to permanently delete{" "}
              <strong>{confirmDelete.name}</strong> ({confirmDelete.domain})? This
              cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.tenantId)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </TenantModalOverlay>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Edit Tenant Modal
// ---------------------------------------------------------------------------
function EditTenantModal({
  tenant,
  onClose,
  onUpdated,
}: {
  tenant: TenantRecord
  onClose: () => void
  onUpdated: (data: Partial<TenantRecord> & { tenantId: string }) => void
}) {
  type TenantEditTab = "identity" | "configuration" | "branding"

  const tabs: Array<{ value: TenantEditTab; label: string }> = [
    { value: "identity", label: "Identity" },
    { value: "configuration", label: "Configuration" },
    { value: "branding", label: "Branding" },
  ]

  const [name, setName] = useState(tenant.name)
  const [wixSiteId, setWixSiteId] = useState(tenant.wixSiteId ?? "")
  const [status, setStatus] = useState(tenant.status)
  const [activeTab, setActiveTab] = useState<TenantEditTab>("identity")
  const [branding, setBranding] = useState<TenantBrandingDraft>({
    logo: tenant.branding?.logo ?? "",
    primaryColor: tenant.branding?.primaryColor ?? "",
    accentColor: tenant.branding?.accentColor ?? "",
    tagline: tenant.branding?.tagline ?? "",
    supportEmail: tenant.branding?.supportEmail ?? "",
    phone: tenant.branding?.phone ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const originalBranding: TenantBrandingDraft = {
    logo: tenant.branding?.logo ?? "",
    primaryColor: tenant.branding?.primaryColor ?? "",
    accentColor: tenant.branding?.accentColor ?? "",
    tagline: tenant.branding?.tagline ?? "",
    supportEmail: tenant.branding?.supportEmail ?? "",
    phone: tenant.branding?.phone ?? "",
  }

  const brandingChanged =
    branding.logo !== originalBranding.logo ||
    branding.primaryColor !== originalBranding.primaryColor ||
    branding.accentColor !== originalBranding.accentColor ||
    branding.tagline !== originalBranding.tagline ||
    branding.supportEmail !== originalBranding.supportEmail ||
    branding.phone !== originalBranding.phone

  const hasChanges =
    name !== tenant.name ||
    wixSiteId !== (tenant.wixSiteId ?? "") ||
    status !== tenant.status ||
    brandingChanged

  const statusLocked = tenant.tenantId === "www"

  const setBrandingField = (key: keyof TenantBrandingDraft, value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) {
      onClose()
      return
    }

    const trimmedSupportEmail = branding.supportEmail.trim()
    if (trimmedSupportEmail && !/^\S+@\S+\.\S+$/.test(trimmedSupportEmail)) {
      setError("Brand support email must be a valid email address")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {}
      if (name !== tenant.name) body.name = name
      if (wixSiteId !== (tenant.wixSiteId ?? "")) body.wixSiteId = wixSiteId
      if (!statusLocked && status !== tenant.status) body.status = status
      if (brandingChanged) body.branding = branding

      const res = await fetch(`/api/admin/tenants/${tenant.tenantId}`, {
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
    <TenantModalOverlay onClose={onClose} panelClassName="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-lg font-bold text-ocean-deep dark:text-tan-100">
          Edit Tenant
        </h2>

        <p className="text-xs text-ocean-deep/60 dark:text-tan-100/60">
          Identity and routing fields are locked to protect tenant routing integrity.
        </p>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 rounded-lg border border-ocean-deep/10 bg-ocean-deep/5 p-2 dark:border-tan-100/10 dark:bg-tan-100/5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-ocean text-white"
                  : "bg-ocean-deep/5 text-ocean-deep/60 hover:bg-ocean-deep/10 dark:bg-tan-100/5 dark:text-tan-100/60 dark:hover:bg-tan-100/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "identity" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
                  Tenant ID
                </span>
                <input
                  type="text"
                  value={tenant.tenantId}
                  readOnly
                  className="input-field cursor-not-allowed bg-ocean-deep/5 font-mono text-xs text-ocean-deep/70 dark:bg-tan-100/5 dark:text-tan-100/70"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
                  Domain
                </span>
                <input
                  type="text"
                  value={tenant.domain}
                  readOnly
                  className="input-field cursor-not-allowed bg-ocean-deep/5 font-mono text-xs text-ocean-deep/70 dark:bg-tan-100/5 dark:text-tan-100/70"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
                Tenant Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </label>
          </div>
        )}

        {activeTab === "configuration" && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
                Wix Site ID
              </span>
              <input
                type="text"
                value={wixSiteId}
                onChange={(e) => setWixSiteId(e.target.value.trim())}
                className="input-field font-mono text-xs"
                placeholder="e.g. d5aa434f-c121-4b4d-92ff-ca864d907891"
              />
              <span className="mt-0.5 block text-xs text-ocean-deep/50 dark:text-tan-100/50">
                Update carefully: this controls tenant content source and booking data path.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TenantRecord["status"])}
                disabled={statusLocked}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="provisioning">Provisioning</option>
              </select>
              {statusLocked && (
                <span className="mt-0.5 block text-xs text-ocean-deep/50 dark:text-tan-100/50">
                  Primary tenant status is locked.
                </span>
              )}
            </label>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="rounded-md border border-ocean-deep/10 bg-ocean-deep/5 p-4 dark:border-tan-100/10 dark:bg-tan-100/5">
            <h3 className="mb-3 text-sm font-semibold text-ocean-deep dark:text-tan-100">
              Branding Overrides
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Logo URL
                </span>
                <input
                  type="text"
                  value={branding.logo}
                  onChange={(e) => setBrandingField("logo", e.target.value)}
                  className="input-field"
                  placeholder="/logos/brand/full_colour.svg"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Primary Color
                </span>
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBrandingField("primaryColor", e.target.value)}
                  className="input-field font-mono text-xs"
                  placeholder="#043750"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Accent Color
                </span>
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) => setBrandingField("accentColor", e.target.value)}
                  className="input-field font-mono text-xs"
                  placeholder="#1282a5"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Tagline
                </span>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBrandingField("tagline", e.target.value)}
                  className="input-field"
                  placeholder="Where Every Journey Becomes a Diamond"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Support Email
                </span>
                <input
                  type="email"
                  value={branding.supportEmail}
                  onChange={(e) => setBrandingField("supportEmail", e.target.value)}
                  className="input-field"
                  placeholder="concierge@sanddiamonds.travel"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ocean-deep/70 dark:text-tan-100/70">
                  Support Phone
                </span>
                <input
                  type="tel"
                  value={branding.phone}
                  onChange={(e) => setBrandingField("phone", e.target.value)}
                  className="input-field"
                  placeholder="+1 876 276-7352"
                />
              </label>
            </div>
          </div>
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
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </TenantModalOverlay>
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
