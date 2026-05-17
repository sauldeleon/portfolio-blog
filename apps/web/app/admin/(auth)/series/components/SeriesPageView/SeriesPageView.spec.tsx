import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import type { SeriesForAdmin } from '@web/lib/db/queries/series'

import { SeriesPageView } from './SeriesPageView'

jest.mock('../SeriesTable', () => ({
  SeriesTable: ({ series }: { series: SeriesForAdmin[] }) => (
    <div data-testid="series-table" data-count={series.length} />
  ),
}))

const mockSeries: SeriesForAdmin[] = [
  { id: 'my-series', postCount: 2, translations: [] },
]

describe('SeriesPageView', () => {
  it('renders the page wrapper', () => {
    renderApp(<SeriesPageView series={mockSeries} title="Series" />)
    expect(screen.getByTestId('admin-series-page')).toBeInTheDocument()
  })

  it('renders the title', () => {
    renderApp(<SeriesPageView series={mockSeries} title="Series" />)
    expect(screen.getByRole('heading', { name: 'Series' })).toBeInTheDocument()
  })

  it('renders SeriesTable with provided series', () => {
    renderApp(<SeriesPageView series={mockSeries} title="Series" />)
    const table = screen.getByTestId('series-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('data-count', '1')
  })
})
