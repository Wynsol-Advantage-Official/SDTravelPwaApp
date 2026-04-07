"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { useAuth } from "@/hooks/useAuth"
import { useTenant } from "@/hooks/useTenant"
import { Card } from "@/components/ui/Card"

export default function TenantAdminPage() {
  return (
    <AuthGuard requiredRole="tenant_admin">
      <TenantAdminDashboard />
    </AuthGuard>
  )
}

function TenantAdminDashboard() {
  const { user } = useAuth()
  const tenant = useTenant()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ocean-deep dark:text-tan-100">
          Tenant Dashboard
        </h1>
        <p className="mt-1 text-sm text-ocean-deep/60 dark:text-tan-100/60">
          Manage your portal — {tenant.tenantName || tenant.tenantId}
        </p>
      </div>

      {/* Recent Bookings */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-ocean-deep dark:text-tan-100">
          Recent Bookings
        </h2>
        <p className="text-sm text-ocean-deep/50 dark:text-tan-100/50">
          Booking data will appear here once connected to Firestore queries
          scoped to tenant: <code>{tenant.tenantId}</code>.
        </p>
      </Card>

      {/* Admin info */}
      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-ocean-deep dark:text-tan-100">
          Portal Details
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-ocean-deep/50 dark:text-tan-100/50">Tenant ID</dt>
            <dd className="font-mono">{tenant.tenantId}</dd>
          </div>
          <div>
            <dt className="text-ocean-deep/50 dark:text-tan-100/50">Wix Site ID</dt>
            <dd className="font-mono">{tenant.wixSiteId || "—"}</dd>
          </div>
          <div>
            <dt className="text-ocean-deep/50 dark:text-tan-100/50">Admin</dt>
            <dd>{user?.displayName || user?.email || "—"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
