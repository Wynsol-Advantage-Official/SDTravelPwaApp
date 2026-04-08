// Focused tests for POST /api/tenants/provision
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
      json: (body: any, opts?: any) => {
        const h = mk();
        if (opts && opts.status) h.set('status', String(opts.status))
        h.set('body', body)
        return { headers: h, status: opts?.status ?? 200, body }
      }
    }
  }
})

jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  }
}))

jest.mock('@/lib/services/provisioning.service', () => ({
  provisionTenant: jest.fn(),
  ProvisionError: class ProvisionError extends Error {},
}))

import { POST } from '@/app/api/tenants/provision/route'
import { adminAuth } from '@/lib/firebase/admin'
import { provisionTenant, ProvisionError } from '@/lib/services/provisioning.service'

function makeReq(cookieValue?: string, body?: any) {
  return {
    cookies: { get: (name: string) => (cookieValue ? { value: cookieValue } : undefined) },
    json: async () => body,
  } as any
}

describe('POST /api/tenants/provision', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns 401 when no session cookie', async () => {
    const res = await POST(makeReq())
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: 'Unauthorized' })
  })

  it('returns 401 when token invalid', async () => {
    ;(adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('bad'))
    const res = await POST(makeReq('bad-token'))
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: 'Invalid session' })
  })

  it('returns 403 when not super_admin', async () => {
    ;(adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', role: 'tenant_admin' })
    const res = await POST(makeReq('token', { subdomain: 'a', tenantName: 'A', wixSiteId: 'w', adminUid: 'u2' }))
    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ error: expect.stringContaining('Forbidden') })
  })

  it('returns 400 when missing fields', async () => {
    ;(adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', role: 'super_admin' })
    const res = await POST(makeReq('token', { subdomain: 'a' }))
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 201 and payload on success', async () => {
    ;(adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', role: 'super_admin' })
    const payload = { subdomain: 'x', tenantName: 'X', wixSiteId: 'w1', adminUid: 'u2' }
    ;(provisionTenant as jest.Mock).mockResolvedValue({ ok: true, tenantId: 'x' })
    const res = await POST(makeReq('token', payload))
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ ok: true, tenantId: 'x' })
  })

  it('maps ProvisionError to proper status', async () => {
    ;(adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1', role: 'super_admin' })
    const err = new ProvisionError('SUBDOMAIN_TAKEN', 'Subdomain taken')
    ;(provisionTenant as jest.Mock).mockRejectedValue(err)
    const res = await POST(makeReq('token', { subdomain: 'x', tenantName: 'X', wixSiteId: 'w1', adminUid: 'u2' }))
    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('code', 'SUBDOMAIN_TAKEN')
  })
})
