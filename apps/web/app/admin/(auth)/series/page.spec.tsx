import { render, screen } from '@testing-library/react'

import type { SeriesForAdmin } from '@web/lib/db/queries/series'

import { SeriesPageView } from './components/SeriesPageView'
import AdminSeriesPage from './page.next'

const mockGetSeriesForAdmin = jest.fn()
const mockRequireAdminSession = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('@web/lib/db/queries/series', () => ({
  getSeriesForAdmin: (...args: unknown[]) => mockGetSeriesForAdmin(...args),
}))

jest.mock('@web/i18n/server', () => ({
  getServerTranslation: jest.fn().mockResolvedValue({
    t: (key: string) => {
      const strings: Record<string, string> = {
        'series.title': 'Series',
      }
      return strings[key] ?? key
    },
  }),
}))

jest.mock('./components/SeriesPageView', () => {
  const React = require('react')
  return {
    SeriesPageView: jest
      .fn()
      .mockReturnValue(
        React.createElement('div', { 'data-testid': 'series-page-view' }),
      ),
  }
})

const mockSeries: SeriesForAdmin[] = [
  { id: 'my-series', postCount: 2, translations: [] },
]

describe('AdminSeriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
    mockGetSeriesForAdmin.mockResolvedValue(mockSeries)
  })

  it('renders SeriesPageView with fetched series', async () => {
    const ui = await AdminSeriesPage()
    render(ui)
    expect(screen.getByTestId('series-page-view')).toBeInTheDocument()
    expect(SeriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ series: mockSeries }),
      undefined,
    )
    expect(mockRequireAdminSession).toHaveBeenCalledTimes(1)
  })

  it('passes translated title to SeriesPageView', async () => {
    const ui = await AdminSeriesPage()
    render(ui)
    expect(SeriesPageView).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Series' }),
      undefined,
    )
  })

  it('does not fetch series when the admin session check redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    mockRequireAdminSession.mockRejectedValue(redirectError)
    await expect(AdminSeriesPage()).rejects.toBe(redirectError)
    expect(mockGetSeriesForAdmin).not.toHaveBeenCalled()
  })
})
