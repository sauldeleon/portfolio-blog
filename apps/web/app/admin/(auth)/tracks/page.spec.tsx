import { render, screen } from '@testing-library/react'

import AdminTracksPage from './page.next'

const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('./components/TrackList', () => ({
  TrackList: () => <div data-testid="track-list" />,
}))

describe('AdminTracksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders the track list', async () => {
    render(await AdminTracksPage())
    expect(screen.getByTestId('track-list')).toBeInTheDocument()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('propagates the session redirect', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminTracksPage()).rejects.toBe(redirectError)
  })
})
