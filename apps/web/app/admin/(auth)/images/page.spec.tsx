import { render, screen } from '@testing-library/react'

import AdminImagesPage from './page.next'

const mockRequireAdminSession = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('./components/ImageManager', async () => {
  const React = await import('react')
  return {
    ImageManager: vi
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'image-manager' }),
      ),
  }
})

describe('AdminImagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders ImageManager component', async () => {
    const ui = await AdminImagesPage()
    render(ui)
    expect(screen.getByTestId('image-manager')).toBeInTheDocument()
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('does not render when session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminImagesPage()).rejects.toBe(redirectError)
  })
})
