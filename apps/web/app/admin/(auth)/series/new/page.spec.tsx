import { render, screen } from '@testing-library/react'

import { SeriesForm } from '../components/SeriesForm'
import NewSeriesPage from './page.next'

const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'series.form.createTitle': 'New series',
        'series.form.back': '← Back to series',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('../components/SeriesForm', () => {
  const React = require('react')
  return {
    SeriesForm: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'series-form' }),
      ),
  }
})

describe('NewSeriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders SeriesForm with correct props', async () => {
    const ui = await NewSeriesPage()
    render(ui)
    expect(screen.getByTestId('series-form')).toBeInTheDocument()
    expect(SeriesForm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New series',
        backLabel: '← Back to series',
      }),
      undefined,
    )
  })

  it('does not render when session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(NewSeriesPage()).rejects.toBe(redirectError)
  })
})
