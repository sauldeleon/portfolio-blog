import { render, screen } from '@testing-library/react'

import UsersLayout from './layout.next'

const mockRequireAdminRoleSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminRoleSession', () => ({
  requireAdminRoleSession: (...args: unknown[]) =>
    mockRequireAdminRoleSession(...args),
}))

describe('UsersLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when authorized', async () => {
    mockRequireAdminRoleSession.mockResolvedValue({
      user: { id: 'u1', name: 'admin', role: 'admin' },
    })
    const ui = await UsersLayout({
      children: <div data-testid="child" />,
    })
    render(ui)
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(mockRequireAdminRoleSession).toHaveBeenCalledTimes(1)
  })
})
