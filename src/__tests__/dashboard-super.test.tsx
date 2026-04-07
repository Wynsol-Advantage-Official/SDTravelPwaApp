import React from 'react'
import { render, screen } from '@testing-library/react'

// Bypass AuthGuard to render the dashboard content directly in tests
jest.mock('@/components/auth/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Super Admin dashboard (smoke)', () => {
  it('renders Platform Overview header', async () => {
    const { default: SuperAdminPage } = await import('@/app/dashboard/super/page')
    render(<SuperAdminPage />)

    expect(await screen.findByText('Platform Overview')).toBeInTheDocument()
  })
})
