"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { useTenant } from "@/hooks/useTenant"
import { Card } from "@/components/ui/Card"
import {
  Settings,
  Palette,
  Phone,
  Plug,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react"
import type { Tenant, TenantBranding } from "@/types/tenant"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "general" | "branding" | "contact" | "integration"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings size={15} /> },
  { id: "branding", label: "Branding", icon: <Palette size={15} /> },
  { id: "contact", label: "Contact", icon: <Phone size={15} /> },
  { id: "integration", label: "Integration", icon: <Plug size={15} /> },
]

// ---------------------------------------------------------------------------
// Sub-forms
// ---------------------------------------------------------------------------

interface GeneralFormProps {
  name: string
  tagline: string
  onChange: (field: string, value: string) => void
}

function GeneralForm({ name, tagline, onChange }: GeneralFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
          Portal Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean"
          placeholder="e.g. Luxury Escapes"
        />
        <p className="mt-1 text-xs text-ocean-deep/50 dark:text-tan-100/50">
          The display name for your portal.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
          Tagline
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => onChange("branding.tagline", e.target.value)}
          className="w-full rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean"
          placeholder="e.g. Where Every Journey Becomes a Diamond"
        />
        <p className="mt-1 text-xs text-ocean-deep/50 dark:text-tan-100/50">
          Shown in the portal header and marketing materials.
        </p>
      </div>
    </div>
  )
}

interface BrandingFormProps {
  branding: Partial<TenantBranding>
  onChange: (field: string, value: string) => void
}

function BrandingForm({ branding, onChange }: BrandingFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
          Logo URL
        </label>
        <input
          type="url"
          value={branding.logo ?? ""}
          onChange={(e) => onChange("branding.logo", e.target.value)}
          className="w-full rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean"
          placeholder="https://example.com/logo.png"
        />
        {branding.logo && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={branding.logo}
              alt="Logo preview"
              className="h-10 w-auto rounded object-contain border border-ocean-deep/10"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = "none"
              }}
            />
            <span className="text-xs text-ocean-deep/50 dark:text-tan-100/50">Preview</span>
          </div>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.primaryColor ?? "#1a3a5c"}
              onChange={(e) => onChange("branding.primaryColor", e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-ocean-deep/20 p-0.5"
            />
            <input
              type="text"
              value={branding.primaryColor ?? ""}
              onChange={(e) => onChange("branding.primaryColor", e.target.value)}
              className="flex-1 rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean font-mono"
              placeholder="#1a3a5c"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.accentColor ?? "#c8a97e"}
              onChange={(e) => onChange("branding.accentColor", e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-ocean-deep/20 p-0.5"
            />
            <input
              type="text"
              value={branding.accentColor ?? ""}
              onChange={(e) => onChange("branding.accentColor", e.target.value)}
              className="flex-1 rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean font-mono"
              placeholder="#c8a97e"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ContactFormProps {
  supportEmail: string
  phone: string
  onChange: (field: string, value: string) => void
}

function ContactForm({ supportEmail, phone, onChange }: ContactFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
          Support Email
        </label>
        <input
          type="email"
          value={supportEmail}
          onChange={(e) => onChange("branding.supportEmail", e.target.value)}
          className="w-full rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean"
          placeholder="support@yourportal.com"
        />
        <p className="mt-1 text-xs text-ocean-deep/50 dark:text-tan-100/50">
          Shown to customers on booking confirmation emails.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange("branding.phone", e.target.value)}
          className="w-full rounded border border-ocean-deep/20 bg-white dark:bg-ocean-deep/30 px-3 py-2 text-sm text-ocean-deep dark:text-tan-100 focus:outline-none focus:ring-2 focus:ring-ocean"
          placeholder="+1 555 000 0000"
        />
      </div>
    </div>
  )
}

interface IntegrationPanelProps {
  tenant: Tenant
}

function IntegrationPanel({ tenant }: IntegrationPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded bg-ocean/5 dark:bg-ocean/10 border border-ocean/20 p-3 text-sm text-ocean-deep dark:text-tan-100/80">
        <Info size={15} className="mt-0.5 shrink-0 text-ocean" />
        <p>
          Integration settings are managed by the platform administrator. Contact support to
          update your Wix Site ID or domain.
        </p>
      </div>
      <ReadOnlyField label="Wix Site ID" value={tenant.wixSiteId || "Not configured"} mono />
      <ReadOnlyField label="Domain" value={tenant.domain || "—"} />
      <ReadOnlyField label="Tenant ID" value={tenant.tenantId} mono />
      <ReadOnlyField
        label="Status"
        value={tenant.status}
        badge={
          tenant.status === "active"
            ? "success"
            : tenant.status === "suspended"
              ? "error"
              : "warning"
        }
      />
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  mono = false,
  badge,
}: {
  label: string
  value: string
  mono?: boolean
  badge?: "success" | "error" | "warning"
}) {
  const badgeClass =
    badge === "success"
      ? "bg-green-100 text-green-700"
      : badge === "error"
        ? "bg-red-100 text-red-700"
        : badge === "warning"
          ? "bg-amber-100 text-amber-700"
          : ""

  return (
    <div>
      <label className="block text-sm font-medium text-ocean-deep dark:text-tan-100 mb-1">
        {label}
      </label>
      {badge ? (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <p
          className={`text-sm text-ocean-deep/70 dark:text-tan-100/70 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TenantSettingsPage() {
  return (
    <AuthGuard requiredRole="tenant_admin">
      <SettingsContent />
    </AuthGuard>
  )
}

function SettingsContent() {
  const { user } = useAuth()
  const tenant = useTenant()

  const [activeTab, setActiveTab] = useState<Tab>("general")
  const [data, setData] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Controlled form state — mirrors the server data
  const [formName, setFormName] = useState("")
  const [formBranding, setFormBranding] = useState<Partial<TenantBranding>>({})
  // Local display name: starts from useTenant() but updated immediately on save
  // (useTenant() is frozen at server render; Edge Config propagates on next load)
  const [displayName, setDisplayName] = useState(tenant.tenantName || tenant.tenantId)

  // ── Load tenant settings ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/admin/tenant-settings", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to load settings")
      }
      const body = (await res.json()) as { tenant: Tenant }
      setData(body.tenant)
      setFormName(body.tenant.name ?? "")
      setFormBranding(body.tenant.branding ?? {})
      setDisplayName(body.tenant.name || tenant.tenantId)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load settings")
      setSaveStatus("error")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  // ── Handle field changes ─────────────────────────────────────────────────
  const handleChange = (field: string, value: string) => {
    if (field === "name") {
      setFormName(value)
    } else if (field.startsWith("branding.")) {
      const key = field.slice("branding.".length) as keyof TenantBranding
      setFormBranding((prev) => ({ ...prev, [key]: value }))
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveStatus("idle")
    try {
      const idToken = await user.getIdToken()
      const res = await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: formName, branding: formBranding }),
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error ?? "Failed to save settings")
      }
      const body = (await res.json()) as { tenant: Tenant }
      setData(body.tenant)
      setDisplayName(body.tenant.name || tenant.tenantId)
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save settings")
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ocean-deep dark:text-tan-100">
          Portal Settings
        </h1>
        <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
          Manage your portal configuration — {displayName}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-ocean" />
        </div>
      ) : (
        <Card padding={false}>
          {/* Tab bar */}
          <div className="border-b border-ocean-deep/10 dark:border-tan-100/10">
            <nav className="flex overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "flex items-center gap-2 whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-b-2 border-ocean text-ocean"
                      : "text-ocean-deep/50 hover:text-ocean-deep dark:text-tan-100/50 dark:hover:text-tan-100",
                  ].join(" ")}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "general" && (
              <GeneralForm
                name={formName}
                tagline={formBranding.tagline ?? ""}
                onChange={handleChange}
              />
            )}
            {activeTab === "branding" && (
              <BrandingForm branding={formBranding} onChange={handleChange} />
            )}
            {activeTab === "contact" && (
              <ContactForm
                supportEmail={formBranding.supportEmail ?? ""}
                phone={formBranding.phone ?? ""}
                onChange={handleChange}
              />
            )}
            {activeTab === "integration" && data && (
              <IntegrationPanel tenant={data} />
            )}
          </div>

          {/* Footer: save button + status */}
          {activeTab !== "integration" && (
            <div className="flex items-center justify-between border-t border-ocean-deep/10 dark:border-tan-100/10 px-6 py-4">
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === "success" && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 size={15} />
                    Saved successfully
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle size={15} />
                    {errorMessage}
                  </span>
                )}
              </div>
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-2 rounded bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean/90 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Changes
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
