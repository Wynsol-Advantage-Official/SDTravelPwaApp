"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react"
import {
  isReservedSubdomain,
  isValidTenantSlug,
} from "@/lib/rules/tenant-rules"
import { TenantModalOverlay } from "./TenantModalOverlay"
import { TenantWizardStepper } from "./TenantWizardStepper"
import type {
  ProvisionedTenantSummary,
  TenantBrandingDraft,
} from "./types"

const STEPS = ["Tenant", "Admin", "Branding", "Review"]
const DEFAULT_BRANDING: TenantBrandingDraft = {
  logo: "",
  primaryColor: "",
  accentColor: "",
  tagline: "",
  supportEmail: "",
  phone: "",
}

interface WizardFormState {
  subdomain: string
  tenantName: string
  wixSiteId: string
  adminEmail: string
  adminPassword: string
  adminDisplayName: string
  branding: TenantBrandingDraft
}

interface CreatedAdminSummary {
  uid: string
  email: string
}

type ProgressState = "idle" | "running" | "done" | "error"

export function AddTenantWizardModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (tenantId: string) => Promise<void> | void
}) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<WizardFormState>({
    subdomain: "",
    tenantName: "",
    wixSiteId: "",
    adminEmail: "",
    adminPassword: "",
    adminDisplayName: "",
    branding: DEFAULT_BRANDING,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdminSummary | null>(null)
  const [createdTenant, setCreatedTenant] = useState<ProvisionedTenantSummary | null>(null)
  const [progress, setProgress] = useState({
    createUser: "idle" as ProgressState,
    provisionTenant: "idle" as ProgressState,
    saveBranding: "idle" as ProgressState,
  })

  const normalizedSubdomain = useMemo(
    () => form.subdomain.trim().toLowerCase(),
    [form.subdomain],
  )
  const domainPreview = normalizedSubdomain
    ? `${normalizedSubdomain}.sanddiamonds.travel`
    : "yourtenant.sanddiamonds.travel"
  const brandingEnabled = useMemo(
    () => Object.values(form.branding).some((value) => value.trim().length > 0),
    [form.branding],
  )

  const setField = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const setBrandingField = (key: keyof TenantBrandingDraft, value: string) => {
    setForm((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [key]: value,
      },
    }))
  }

  const handleNext = () => {
    const validationError = validateStep(step, form, normalizedSubdomain)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setError(null)
    setStep((current) => Math.max(current - 1, 0))
  }

  const handleSubmit = async () => {
    const validationError = validateStep(step, form, normalizedSubdomain)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)
    setProgress({
      createUser: "running",
      provisionTenant: "idle",
      saveBranding: brandingEnabled ? "idle" : "done",
    })

    let currentStage: keyof typeof progress = "createUser"
    let localCreatedAdmin: CreatedAdminSummary | null = null
    let localCreatedTenant: ProvisionedTenantSummary | null = null

    try {
      const createUserResponse = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.adminEmail.trim(),
          password: form.adminPassword,
          displayName: form.adminDisplayName.trim() || undefined,
          role: "user",
        }),
      })
      const createUserData = await readJson(createUserResponse)
      if (!createUserResponse.ok) {
        throw new Error(getErrorMessage(createUserData, createUserResponse.status))
      }

      localCreatedAdmin = {
        uid: String(createUserData.uid),
        email: String(createUserData.email ?? form.adminEmail.trim()),
      }
      setCreatedAdmin(localCreatedAdmin)
      setProgress((prev) => ({ ...prev, createUser: "done", provisionTenant: "running" }))
      currentStage = "provisionTenant"

      const provisionResponse = await fetch("/api/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: normalizedSubdomain,
          tenantName: form.tenantName.trim(),
          wixSiteId: form.wixSiteId.trim(),
          adminUid: localCreatedAdmin.uid,
        }),
      })
      const provisionData = await readJson(provisionResponse)
      if (!provisionResponse.ok) {
        throw new Error(getErrorMessage(provisionData, provisionResponse.status))
      }

      const provisionedTenant: ProvisionedTenantSummary = {
        tenantId: String(provisionData.tenantId),
        domain: String(provisionData.domain),
        status: "active",
      }
      localCreatedTenant = provisionedTenant
      setCreatedTenant(provisionedTenant)

      if (brandingEnabled) {
        setProgress((prev) => ({
          ...prev,
          provisionTenant: "done",
          saveBranding: "running",
        }))
        currentStage = "saveBranding"

        const brandingResponse = await fetch(
          `/api/admin/tenants/${provisionedTenant.tenantId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branding: buildBrandingPayload(form.branding) }),
          },
        )
        const brandingData = await readJson(brandingResponse)
        if (!brandingResponse.ok) {
          throw new Error(getErrorMessage(brandingData, brandingResponse.status))
        }
      }

      setProgress({
        createUser: "done",
        provisionTenant: "done",
        saveBranding: brandingEnabled ? "done" : "done",
      })
      await Promise.resolve(onCreated(provisionedTenant.tenantId))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Provisioning failed"
      setProgress((prev) => ({ ...prev, [currentStage]: "error" }))
      if (localCreatedAdmin && !localCreatedTenant) {
        setError(
          `${message} A Firebase user was created for ${localCreatedAdmin.email}; review or clean up that account before retrying.`,
        )
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isSuccess = Boolean(createdTenant) && !submitting && !error && progress.createUser === "done" && progress.provisionTenant === "done" && progress.saveBranding === "done"

  return (
    <TenantModalOverlay onClose={onClose} panelClassName="max-w-4xl">
      {isSuccess && createdTenant && createdAdmin ? (
        <SuccessState
          createdAdmin={createdAdmin}
          createdTenant={createdTenant}
          brandingEnabled={brandingEnabled}
          onClose={onClose}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 pr-8">
            <h2 className="text-xl font-bold text-ocean-deep dark:text-tan-100">
              Add Tenant Wizard
            </h2>
            <p className="text-sm text-ocean-deep/60 dark:text-tan-100/60">
              Create the tenant admin, provision the tenant, and optionally apply white-label branding in one guided flow.
            </p>
          </div>

          <TenantWizardStepper steps={STEPS} currentStep={step} />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              {step === 0 && (
                <TenantBasicsStep
                  domainPreview={domainPreview}
                  normalizedSubdomain={normalizedSubdomain}
                  tenantName={form.tenantName}
                  wixSiteId={form.wixSiteId}
                  onSubdomainChange={(value) => setField("subdomain", value)}
                  onTenantNameChange={(value) => setField("tenantName", value)}
                  onWixSiteIdChange={(value) => setField("wixSiteId", value)}
                />
              )}

              {step === 1 && (
                <TenantAdminStep
                  adminDisplayName={form.adminDisplayName}
                  adminEmail={form.adminEmail}
                  adminPassword={form.adminPassword}
                  onAdminDisplayNameChange={(value) => setField("adminDisplayName", value)}
                  onAdminEmailChange={(value) => setField("adminEmail", value)}
                  onAdminPasswordChange={(value) => setField("adminPassword", value)}
                />
              )}

              {step === 2 && (
                <TenantBrandingStep
                  branding={form.branding}
                  onChange={setBrandingField}
                />
              )}

              {step === 3 && (
                <ReviewStep
                  brandingEnabled={brandingEnabled}
                  createdAdmin={createdAdmin}
                  domainPreview={domainPreview}
                  form={form}
                  normalizedSubdomain={normalizedSubdomain}
                />
              )}
            </div>

            <aside className="space-y-4 rounded-xl border border-ocean-deep/10 bg-ocean-deep/3 p-4 dark:border-tan-100/10 dark:bg-tan-100/3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-deep/70 dark:text-tan-100/70">
                Provisioning Checklist
              </h3>
              <ProgressItem
                icon={<UserPlus className="h-4 w-4" />}
                label="Create tenant admin"
                state={progress.createUser}
              />
              <ProgressItem
                icon={<Globe className="h-4 w-4" />}
                label="Provision tenant and Edge Config"
                state={progress.provisionTenant}
              />
              <ProgressItem
                icon={<Palette className="h-4 w-4" />}
                label="Apply branding"
                state={progress.saveBranding}
              />
              <div className="rounded-lg border border-ocean-deep/10 bg-white/80 p-3 text-xs text-ocean-deep/60 dark:border-tan-100/10 dark:bg-luxury-base/80 dark:text-tan-100/60">
                Wildcard subdomain routing is resolved through Edge Config. The tenant row should appear immediately after creation, and the subdomain should resolve once the Edge Config entry is present.
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-3 border-t border-ocean-deep/10 pt-4 dark:border-tan-100/10 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
            >
              Cancel
            </button>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0 || submitting}
                className="inline-flex items-center gap-1.5 rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tan-100/20 dark:text-tan-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90 disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Create Tenant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </TenantModalOverlay>
  )
}

function TenantBasicsStep({
  domainPreview,
  normalizedSubdomain,
  tenantName,
  wixSiteId,
  onSubdomainChange,
  onTenantNameChange,
  onWixSiteIdChange,
}: {
  domainPreview: string
  normalizedSubdomain: string
  tenantName: string
  wixSiteId: string
  onSubdomainChange: (value: string) => void
  onTenantNameChange: (value: string) => void
  onWixSiteIdChange: (value: string) => void
}) {
  const reserved = normalizedSubdomain ? isReservedSubdomain(normalizedSubdomain) : false

  return (
    <div className="space-y-4">
      <FieldGroup
        label="Tenant name"
        hint="Public display name used throughout the portal."
        required
      >
        <input
          type="text"
          value={tenantName}
          onChange={(e) => onTenantNameChange(e.target.value)}
          className="input-field"
          placeholder="Acme Travel Co."
        />
      </FieldGroup>

      <FieldGroup
        label="Subdomain"
        hint="Lowercase letters, numbers, and hyphens only."
        required
      >
        <input
          type="text"
          value={normalizedSubdomain}
          onChange={(e) => onSubdomainChange(e.target.value.toLowerCase())}
          className="input-field font-mono text-sm"
          placeholder="acme"
        />
        <p className="mt-2 text-xs text-ocean-deep/60 dark:text-tan-100/60">
          Domain preview: <span className="font-mono">{domainPreview}</span>
        </p>
        {reserved && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            This subdomain is reserved.
          </p>
        )}
      </FieldGroup>

      <FieldGroup
        label="Wix site ID"
        hint="Headless CMS site ID used to resolve content for this tenant."
        required
      >
        <input
          type="text"
          value={wixSiteId}
          onChange={(e) => onWixSiteIdChange(e.target.value.trim())}
          className="input-field font-mono text-xs"
          placeholder="f9134a28-01c2-46a5-94e3-ed354974e4b8"
        />
      </FieldGroup>
    </div>
  )
}

function TenantAdminStep({
  adminDisplayName,
  adminEmail,
  adminPassword,
  onAdminDisplayNameChange,
  onAdminEmailChange,
  onAdminPasswordChange,
}: {
  adminDisplayName: string
  adminEmail: string
  adminPassword: string
  onAdminDisplayNameChange: (value: string) => void
  onAdminEmailChange: (value: string) => void
  onAdminPasswordChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ocean-deep/10 bg-ocean-deep/3 p-4 text-sm text-ocean-deep/70 dark:border-tan-100/10 dark:bg-tan-100/3 dark:text-tan-100/70">
        The wizard creates the admin account first, then the tenant provisioning API promotes that user to <span className="font-semibold">tenant_admin</span> with the new tenant claim.
      </div>

      <FieldGroup label="Admin display name" hint="Optional; shown in Firebase Auth and dashboard lists.">
        <input
          type="text"
          value={adminDisplayName}
          onChange={(e) => onAdminDisplayNameChange(e.target.value)}
          className="input-field"
          placeholder="Avery Stone"
        />
      </FieldGroup>

      <FieldGroup label="Admin email" required>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => onAdminEmailChange(e.target.value)}
          className="input-field"
          placeholder="admin@example.com"
        />
      </FieldGroup>

      <FieldGroup label="Temporary password" hint="Must be at least 6 characters." required>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => onAdminPasswordChange(e.target.value)}
          className="input-field"
          placeholder="Minimum 6 characters"
        />
      </FieldGroup>
    </div>
  )
}

function TenantBrandingStep({
  branding,
  onChange,
}: {
  branding: TenantBrandingDraft
  onChange: (key: keyof TenantBrandingDraft, value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label="Logo URL" hint="Optional public asset URL for the tenant logo.">
          <input
            type="url"
            value={branding.logo}
            onChange={(e) => onChange("logo", e.target.value)}
            className="input-field"
            placeholder="https://cdn.example.com/logo.svg"
          />
        </FieldGroup>

        <FieldGroup label="Support email" hint="Optional contact email shown in brand surfaces.">
          <input
            type="email"
            value={branding.supportEmail}
            onChange={(e) => onChange("supportEmail", e.target.value)}
            className="input-field"
            placeholder="support@example.com"
          />
        </FieldGroup>

        <FieldGroup label="Support phone" hint="Optional contact number shown in tenant contact channels.">
          <input
            type="tel"
            value={branding.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="input-field"
            placeholder="+1 876 276-7352"
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ColorField
          label="Primary color"
          value={branding.primaryColor}
          onChange={(value) => onChange("primaryColor", value)}
        />
        <ColorField
          label="Accent color"
          value={branding.accentColor}
          onChange={(value) => onChange("accentColor", value)}
        />
      </div>

      <FieldGroup label="Tagline" hint="Short marketing line for the portal hero or metadata.">
        <input
          type="text"
          value={branding.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          className="input-field"
          placeholder="Where every journey becomes a diamond"
        />
      </FieldGroup>
    </div>
  )
}

function ReviewStep({
  brandingEnabled,
  createdAdmin,
  domainPreview,
  form,
  normalizedSubdomain,
}: {
  brandingEnabled: boolean
  createdAdmin: CreatedAdminSummary | null
  domainPreview: string
  form: WizardFormState
  normalizedSubdomain: string
}) {
  return (
    <div className="space-y-4">
      <SummaryCard
        icon={<Globe className="h-4 w-4" />}
        title="Tenant details"
        rows={[
          ["Tenant name", form.tenantName.trim() || "—"],
          ["Subdomain", normalizedSubdomain || "—"],
          ["Domain", domainPreview],
          ["Wix site ID", form.wixSiteId.trim() || "—"],
        ]}
      />
      <SummaryCard
        icon={<ShieldCheck className="h-4 w-4" />}
        title="Admin account"
        rows={[
          ["Display name", form.adminDisplayName.trim() || "—"],
          ["Email", form.adminEmail.trim() || "—"],
          ["UID", createdAdmin?.uid ?? "Will be generated on submit"],
        ]}
      />
      <SummaryCard
        icon={<Palette className="h-4 w-4" />}
        title="Branding"
        rows={brandingEnabled ? [
          ["Logo", form.branding.logo.trim() || "—"],
          ["Primary", form.branding.primaryColor.trim() || "—"],
          ["Accent", form.branding.accentColor.trim() || "—"],
          ["Tagline", form.branding.tagline.trim() || "—"],
          ["Support", form.branding.supportEmail.trim() || "—"],
          ["Phone", form.branding.phone.trim() || "—"],
        ] : [["Branding", "No branding overrides will be applied during creation"]]}
      />
    </div>
  )
}

function SuccessState({
  createdAdmin,
  createdTenant,
  brandingEnabled,
  onClose,
}: {
  createdAdmin: CreatedAdminSummary
  createdTenant: ProvisionedTenantSummary
  brandingEnabled: boolean
  onClose: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 pr-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ocean-deep dark:text-tan-100">
            Tenant created successfully
          </h2>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            The tenant is now provisioned and the admin account has been assigned the tenant admin role.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          icon={<Globe className="h-4 w-4" />}
          title="Tenant"
          rows={[
            ["Tenant ID", createdTenant.tenantId],
            ["Domain", createdTenant.domain],
            ["Status", createdTenant.status],
          ]}
        />
        <SummaryCard
          icon={<Mail className="h-4 w-4" />}
          title="Admin"
          rows={[
            ["Email", createdAdmin.email],
            ["UID", createdAdmin.uid],
            ["Branding", brandingEnabled ? "Applied" : "Skipped"],
          ]}
        />
      </div>

      <div className="rounded-xl border border-ocean-deep/10 bg-ocean-deep/3 p-4 text-sm text-ocean-deep/70 dark:border-tan-100/10 dark:bg-tan-100/3 dark:text-tan-100/70">
        <p className="font-medium text-ocean-deep dark:text-tan-100">Next actions</p>
        <ul className="mt-2 space-y-2">
          <li>Ask the new tenant admin to sign out and back in so Firebase refreshes their custom claims.</li>
          <li>Verify the new tenant resolves correctly once the Edge Config entry is available to the wildcard route.</li>
          <li>Review the tenant row in the management table and update branding or status later if needed.</li>
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <a
          href={`https://${createdTenant.domain}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-ocean-deep/20 px-4 py-2 text-sm font-medium text-ocean-deep transition-colors hover:bg-ocean-deep/5 dark:border-tan-100/20 dark:text-tan-100"
        >
          Visit domain
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean/90"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  rows,
  title,
}: {
  icon: ReactNode
  rows: Array<[string, string]>
  title: string
}) {
  return (
    <div className="rounded-xl border border-ocean-deep/10 bg-white/90 p-4 dark:border-tan-100/10 dark:bg-luxury-base/90">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ocean-deep dark:text-tan-100">
        {icon}
        {title}
      </div>
      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3">
            <span className="text-ocean-deep/50 dark:text-tan-100/50">{label}</span>
            <span className="max-w-[70%] text-right font-medium text-ocean-deep dark:text-tan-100">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FieldGroup({
  children,
  hint,
  label,
  required = false,
}: {
  children: ReactNode
  hint?: string
  label: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ocean-deep dark:text-tan-100">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-ocean-deep/50 dark:text-tan-100/50">
          {hint}
        </span>
      )}
    </label>
  )
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <FieldGroup label={label} hint="Optional hex color value, for example #076a95.">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizeColorValue(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 rounded border border-ocean-deep/15 bg-transparent p-1 dark:border-tan-100/15"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field font-mono text-xs"
          placeholder="#076a95"
        />
      </div>
    </FieldGroup>
  )
}

function ProgressItem({
  icon,
  label,
  state,
}: {
  icon: React.ReactNode
  label: string
  state: ProgressState
}) {
  const tone = {
    idle: "text-ocean-deep/50 dark:text-tan-100/50",
    running: "text-ocean dark:text-tan-100",
    done: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-300",
  }[state]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-ocean-deep/10 bg-white/70 px-3 py-2 dark:border-tan-100/10 dark:bg-luxury-base/70">
      <span className={tone}>
        {state === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ocean-deep dark:text-tan-100">{label}</p>
        <p className="text-xs capitalize text-ocean-deep/50 dark:text-tan-100/50">{state}</p>
      </div>
    </div>
  )
}

function buildBrandingPayload(branding: TenantBrandingDraft) {
  return Object.fromEntries(
    Object.entries(branding).filter(([, value]) => value.trim().length > 0),
  )
}

function normalizeColorValue(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : "#076a95"
}

function validateStep(step: number, form: WizardFormState, normalizedSubdomain: string) {
  if (step === 0) {
    if (!form.tenantName.trim()) return "Tenant name is required."
    if (!normalizedSubdomain) return "Subdomain is required."
    if (isReservedSubdomain(normalizedSubdomain)) {
      return `"${normalizedSubdomain}" is reserved and cannot be used.`
    }
    if (!isValidTenantSlug(normalizedSubdomain)) {
      return "Subdomain must use lowercase letters, numbers, and hyphens only."
    }
    if (!form.wixSiteId.trim()) return "Wix site ID is required."
  }

  if (step === 1) {
    if (!/^\S+@\S+\.\S+$/.test(form.adminEmail.trim())) {
      return "Enter a valid admin email address."
    }
    if (form.adminPassword.length < 6) {
      return "Temporary password must be at least 6 characters."
    }
  }

  if (step === 2 && form.branding.supportEmail.trim()) {
    if (!/^\S+@\S+\.\S+$/.test(form.branding.supportEmail.trim())) {
      return "Support email must be a valid email address."
    }
  }

  return null
}

async function readJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function getErrorMessage(data: Record<string, unknown>, status: number) {
  if (typeof data.error === "string" && data.error) return data.error
  return `HTTP ${status}`
}
