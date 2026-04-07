import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the useAuth hook so we can simulate roles and auth states
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

import { useAuth } from '@/hooks/useAuth'
import SuperAdminPage from '@/app/dashboard/super/page'

const mockedUseAuth = useAuth as unknown as jest.Mock

describe('AuthGuard role enforcement', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset()
  })

  it('allows super_admin to see the dashboard', async () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'u1' },
      loading: false,
      isAdmin: true,
      role: 'super_admin',
      tenantId: 'solnica',
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<SuperAdminPage />)

    expect(await screen.findByText('Platform Overview')).toBeInTheDocument()
  })

  it('blocks tenant_admin from super_admin pages', async () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'u2' },
      loading: false,
      isAdmin: true,
      role: 'tenant_admin',
      tenantId: 'solnica',
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<SuperAdminPage />)

    expect(await screen.findByText('Access Denied')).toBeInTheDocument()
  })

  it('prompts sign-in when unauthenticated', async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAdmin: false,
      role: 'user',
      tenantId: null,
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<SuperAdminPage />)

    expect(await screen.findByText('Sign In Required')).toBeInTheDocument()
  })
})
