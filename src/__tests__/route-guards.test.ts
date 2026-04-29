// Mock Next.js server helpers to avoid web Request/Response import issues in Jest
jest.mock('next/server', () => {
  const mk = () => {
    const map = new Map()
    return {
      get: (k: string) => map.get(k),
      set: (k: string, v: any) => map.set(k, v),
    }
  }
  return {
    NextResponse: {
      next: () => ({ headers: mk() }),
      redirect: (url: any) => {
        const h = mk()
        h.set('location', typeof url === 'string' ? url : url.toString())
        return { headers: h, status: 307 }
      },
    },
  }
})

import { proxy } from '@/proxy'

jest.mock('@/lib/edge-config', () => ({
  lookupTenant: jest.fn(),
  DEFAULT_TENANT: { tenantId: 'www', siteId: 'default', name: 'WWW' },
}))

jest.mock('@/lib/auth/session', () => ({
  decodeSessionCookie: jest.fn(),
}))

import { lookupTenant } from '@/lib/edge-config'
import { decodeSessionCookie } from '@/lib/auth/session'

function makeReq(host: string, path = '/', cookies: Record<string,string> = {}) {
  const nextUrl = {
    pathname: path,
    hostname: host,
    clone() {
      const obj: any = {
        hostname: this.hostname,
        pathname: this.pathname,
        port: '',
        searchParams: new URLSearchParams(),
      }
      obj.toString = function () {
        const qs = this.searchParams && this.searchParams.toString() ? `?${this.searchParams.toString()}` : ''
        return `https://${this.hostname}${this.pathname}${qs}`
      }
      return obj
    },
  }

  return {
    nextUrl,
    headers: { get: (k: string) => host },
    cookies: { get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined) },
  } as any
}

describe('proxy route guards', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('redirects unknown subdomain to www', async () => {
    ;(lookupTenant as jest.Mock).mockResolvedValue(null)
    const req = makeReq('unknown.sanddiamonds.travel', '/')
    const res: any = await proxy(req)
    const loc = res.headers.get('location')
    expect(loc).toMatch(/www\.sanddiamonds\.travel/)
  })

  it('protects routes when no session', async () => {
    ;(lookupTenant as jest.Mock).mockResolvedValue({ tenantId: 'solnica', siteId: 's1', name: 'Solnica' })
    ;(decodeSessionCookie as jest.Mock).mockReturnValue(null)
    const req = makeReq('solnica.sanddiamonds.travel', '/booking/123')
    const res: any = await proxy(req)
    const loc = res.headers.get('location')
    expect(loc).toContain('/auth/sign-in')
    const u = new URL(loc)
    expect(u.searchParams.get('redirect')).toBe('/booking/123')
  })

  it('enforces tenant_admin cross-domain', async () => {
    ;(lookupTenant as jest.Mock).mockResolvedValue({ tenantId: 'other', siteId: 's1', name: 'Other' })
    ;(decodeSessionCookie as jest.Mock).mockReturnValue({ role: 'tenant_admin', tenantId: 'solnica' })
    const req = makeReq('other.sanddiamonds.travel', '/dashboard', { session: 'token' })
    const res: any = await proxy(req)
    const loc = res.headers.get('location')
    expect(loc).toMatch(/solnica\.sanddiamonds\.travel/)
    expect(loc).toContain('/dashboard')
  })

  it('injects tenant headers on success', async () => {
    ;(lookupTenant as jest.Mock).mockResolvedValue({ tenantId: 'solnica', siteId: 's1', name: 'Solnica' })
    ;(decodeSessionCookie as jest.Mock).mockReturnValue({ role: 'user', tenantId: 'solnica' })
    const req = makeReq('solnica.sanddiamonds.travel', '/')
    const res: any = await proxy(req)
    expect(res.headers.get('x-tenant-id')).toBe('solnica')
    expect(res.headers.get('x-wix-site-id')).toBe('s1')
    expect(res.headers.get('x-tenant-name')).toBe('Solnica')
  })
})
