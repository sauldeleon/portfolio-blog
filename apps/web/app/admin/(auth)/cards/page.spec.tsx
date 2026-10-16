import { render, screen } from '@testing-library/react'

import AdminCardsPage from './page.next'

const mockRequireAdminSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('./components/CardGenerator', () => ({
  CardGenerator: () => <div data-testid="card-generator" />,
}))

describe('AdminCardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders the card generator', async () => {
    render(await AdminCardsPage())
    expect(screen.getByTestId('card-generator')).toBeInTheDocument()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('propagates the session redirect', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminCardsPage()).rejects.toBe(redirectError)
  })
})
