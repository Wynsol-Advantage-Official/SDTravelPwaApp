"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function SuperAdminPage() {
  return (
    <AuthGuard requiredRole="super_admin">
      <SuperAdminDashboard />
    </AuthGuard>
  )
}

interface TenantSummary {
  tenantId: string
  name: string
  domain: string
  status: string
}

function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchTenants() {
      try {
        const res = await fetch("/api/admin/tenants")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setTenants(data.tenants ?? [])
      } catch (err) {
        console.error("[Super Dashboard] Failed to fetch tenants:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTenants()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-deep dark:text-tan-100">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
            Super Admin — Sand Diamonds Travel
          </p>
        </div>
        <Link href="/dashboard/super/tenants">
          <Button>Manage Tenants</Button>
        </Link>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Tenants" value={String(tenants.length)} />
        <StatCard label="Total Users" value="—" />
        <StatCard label="Platform Bookings" value="—" />
        <StatCard label="Active Users" value="—" />
      </div>

      {/* Tenants overview */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-ocean-deep dark:text-tan-100">
          Tenants
        </h2>
        {loading ? (
          <p className="text-sm text-ocean-deep/50">Loading…</p>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50 mb-4">
              No tenants provisioned yet. Approve an affiliate application or create one manually.
            </p>
            <Link href="/dashboard/super/tenants">
              <Button>Create Tenant</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ocean-deep/10 dark:border-tan-100/10">
                  <th className="py-2 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">Name</th>
                  <th className="py-2 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">Domain</th>
                  <th className="py-2 text-left font-medium text-ocean-deep/60 dark:text-tan-100/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.tenantId} className="border-b border-ocean-deep/5 dark:border-tan-100/5">
                    <td className="py-3 font-medium">{t.name}</td>
                    <td className="py-3 font-mono text-xs">{t.domain}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/super/tenants">
          <Card className="p-6 hover:ring-2 hover:ring-ocean/30 transition-all cursor-pointer">
            <h3 className="font-semibold text-ocean-deep dark:text-tan-100">Tenant Management</h3>
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50 mt-1">
              Provision, suspend, or configure tenant portals.
            </p>
          </Card>
        </Link>
        <Link href="/dashboard/admin/users">
          <Card className="p-6 hover:ring-2 hover:ring-ocean/30 transition-all cursor-pointer">
            <h3 className="font-semibold text-ocean-deep dark:text-tan-100">User Management</h3>
            <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50 mt-1">
              Manage user accounts, roles, and access permissions.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ocean-deep/50 dark:text-tan-100/50">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-ocean-deep dark:text-tan-100">
        {value}
      </p>
    </Card>
  )
}
