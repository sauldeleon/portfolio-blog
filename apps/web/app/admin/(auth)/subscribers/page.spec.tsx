import { render, screen } from '@testing-library/react'

import type { AdminSubscriptionRecord } from '@web/lib/db/queries/subscriptions'

import { SubscribersPageView } from './components/SubscribersPageView'
import AdminSubscribersPage from './page.next'

const mockGetSubscriptionsAdmin = vi.fn()
const mockRequireAdminSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('@web/lib/db/queries/subscriptions', () => ({
  getSubscriptionsAdmin: () => mockGetSubscriptionsAdmin(),
}))

vi.mock('@web/i18n/server', () => ({
  getServerTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => ({ 'subscribers.title': 'Subscribers' })[key] ?? key,
  }),
}))

vi.mock('./components/SubscribersPageView', async () => {
  const React = await import('react')
  return {
    SubscribersPageView: vi
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'subscribers-page-view' }),
      ),
  }
})

const mockSubscriptions: AdminSubscriptionRecord[] = [
  {
    id: 's1',
    email: 'reader@example.com',
    name: 'Reader',
    status: 'active',
    locale: 'en',
    createdAt: new Date('2024-01-01'),
    confirmedAt: new Date('2024-01-02'),
    enabled: true,
  },
]

describe('AdminSubscribersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    mockGetSubscriptionsAdmin.mockResolvedValue(mockSubscriptions)
  })

  it('renders SubscribersPageView with subscriptions and title', async () => {
    const ui = await AdminSubscribersPage()
    render(ui)
    expect(screen.getByTestId('subscribers-page-view')).toBeInTheDocument()
    expect(SubscribersPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        initialSubscriptions: mockSubscriptions,
        title: 'Subscribers',
      }),
      undefined,
    )
  })

  it('does not fetch subscriptions when session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminSubscribersPage()).rejects.toBe(redirectError)
    expect(mockGetSubscriptionsAdmin).not.toHaveBeenCalled()
  })
})
