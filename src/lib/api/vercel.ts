// ---------------------------------------------------------------------------
// Vercel API helpers — Domain registration + Edge Config updates (SOW §7.1)
// ---------------------------------------------------------------------------
// Server-only: uses VERCEL_TOKEN and VERCEL_PROJECT_ID from env.
// ---------------------------------------------------------------------------

const VERCEL_API = "https://api.vercel.com"

function vercelHeaders() {
  const token = process.env.VERCEL_TOKEN
  if (!token) throw new Error("VERCEL_TOKEN env var is not set")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

function projectId() {
  const id = process.env.VERCEL_PROJECT_ID
  if (!id) throw new Error("VERCEL_PROJECT_ID env var is not set")
  return id
}

function teamId() {
  return process.env.VERCEL_TEAM_ID // optional
}

function teamQuery() {
  const id = teamId()
  return id ? `?teamId=${id}` : ""
}

// ── Domain registration ────────────────────────────────────────────────────

export interface VercelDomainResult {
  name: string
  apexName: string
  verified: boolean
}

/**
 * Register a subdomain (e.g. `acme.sanddiamonds.travel`) with the Vercel project.
 */
export async function addDomainToProject(
  domain: string
): Promise<VercelDomainResult> {
  const res = await fetch(
    `${VERCEL_API}/v10/projects/${projectId()}/domains${teamQuery()}`,
    {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel addDomain failed (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Remove a subdomain from the Vercel project.
 */
export async function removeDomainFromProject(domain: string): Promise<void> {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectId()}/domains/${domain}${teamQuery()}`,
    {
      method: "DELETE",
      headers: vercelHeaders(),
    }
  )

  if (!res.ok && res.status !== 404) {
    const body = await res.text()
    throw new Error(`Vercel removeDomain failed (${res.status}): ${body}`)
  }
}

// ── Edge Config ────────────────────────────────────────────────────────────

function edgeConfigId() {
  // EDGE_CONFIG looks like: https://edge-config.vercel.com/ecfg_xxx?token=xxx
  // We need just the ecfg_xxx id
  const raw = process.env.EDGE_CONFIG
  if (!raw) throw new Error("EDGE_CONFIG env var is not set")
  const match = raw.match(/ecfg_[a-zA-Z0-9]+/)
  if (!match) throw new Error("Could not parse Edge Config ID from EDGE_CONFIG env var")
  return match[0]
}

interface EdgeConfigItem {
  operation: "create" | "update" | "upsert" | "delete"
  key: string
  value?: unknown
}

/**
 * Patch Vercel Edge Config items (add/update/delete tenant entries).
 */
export async function patchEdgeConfig(
  items: EdgeConfigItem[]
): Promise<void> {
  const res = await fetch(
    `${VERCEL_API}/v1/edge-config/${edgeConfigId()}/items${teamQuery()}`,
    {
      method: "PATCH",
      headers: vercelHeaders(),
      body: JSON.stringify({ items }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel Edge Config patch failed (${res.status}): ${body}`)
  }
}

/**
 * Add a tenant entry to Edge Config for sub-millisecond resolution.
 */
export async function upsertTenantEdgeConfig(
  subdomain: string,
  config: { tenantId: string; siteId: string; name: string }
): Promise<void> {
  await patchEdgeConfig([
    { operation: "upsert", key: subdomain, value: config },
  ])
}

/**
 * Remove a tenant entry from Edge Config.
 */
export async function removeTenantEdgeConfig(
  subdomain: string
): Promise<void> {
  await patchEdgeConfig([
    { operation: "delete", key: subdomain },
  ])
}
