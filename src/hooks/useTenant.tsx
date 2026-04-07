"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import type { TenantContext } from "@/types/tenant"

// ---------------------------------------------------------------------------
// Tenant Context — provides tenantId, wixSiteId, tenantName to client trees
// ---------------------------------------------------------------------------
// The server reads x-tenant-id / x-wix-site-id headers injected by Edge
// Middleware and passes them down as props to this provider in layout.tsx.
// ---------------------------------------------------------------------------

const TenantCtx = createContext<TenantContext | null>(null)

interface TenantProviderProps {
  value: TenantContext
  children: ReactNode
}

export function TenantProvider({ value, children }: TenantProviderProps) {
  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>
}

export function useTenant(): TenantContext {
  const ctx = useContext(TenantCtx)
  if (!ctx) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return ctx
}
