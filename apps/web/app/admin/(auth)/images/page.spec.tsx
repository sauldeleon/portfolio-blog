import { render, screen } from '@testing-library/react'

import AdminImagesPage from './page.next'

const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('./components/ImageManager', () => {
  const React = require('react')
  return {
    ImageManager: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'image-manager' }),
      ),
  }
})

describe('AdminImagesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
