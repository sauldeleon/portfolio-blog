import { render, screen } from '@testing-library/react'

import type { CanyoningCardData, CroquisObstacle } from '@web/lib/cards'

import { CanyonReportDocument } from './CanyonReportDocument'

const obstacles: CroquisObstacle[] = [
  {
    type: 'rapel',
    title: 'Rappel 1',
    meters: 10,
    side: 'left',
    severity: 'danger',
    notes: [{ text: 'Be careful', sub: false }],
    photos: ['https://res.cloudinary.com/x/image/upload/v1/a.jpg'],
  },
  {
    type: 'salto',
    title: 'Jump 1',
    meters: null,
    side: 'right',
    severity: 'caution',
    notes: [],
    photos: ['https://res.cloudinary.com/x/image/upload/v1/b.jpg'],
  },
  {
    type: 'tobogan',
    title: 'Slide 1',
    meters: 3,
    side: null,
    severity: 'easy',
    notes: [{ text: 'Fun one', sub: false }],
    photos: ['https://res.cloudinary.com/x/image/upload/v1/c.jpg'],
  },
  {
    type: 'salto-rapel',
    title: 'Split 1',
    meters: 8,
    side: null,
    severity: 'easy',
    notes: [],
    photos: ['https://res.cloudinary.com/x/image/upload/v1/d.jpg'],
  },
  {
    // No photos → filtered out of the waypoint sections.
    type: 'salto',
    title: 'Jump 2',
    meters: 4,
    side: null,
    severity: 'easy',
    notes: [],
  },
]

const fullSummary: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'en',
  title: 'Summary',
  grade: 'v4a3II',
  desnivel: '300m',
  maxRappel: '45m',
  rappels: '12',
  approach: '30min',
  inCanyon: '4h',
  returnTime: '20min',
  total: '5h',
  rope: '2x60m',
  flowLevel: 'normal',
  season: 'summer',
  cars: '2',
}

describe('CanyonReportDocument', () => {
  it('renders the report with summary, disclaimer, croquis and waypoint sections', () => {
    render(
      <CanyonReportDocument
        title="Barranco Test"
        lang="en"
        obstacles={obstacles}
        summary={fullSummary}
      />,
    )

    expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
    // Appears both as the page title and in the croquis header.
    expect(screen.getAllByText('Barranco Test').length).toBeGreaterThan(0)
    // Summary section + mapped flow value + disclaimer.
    expect(screen.getByText("That day's figures")).toBeInTheDocument()
    expect(screen.getByText('v4a3II')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText(/Use it as a rough reference/)).toBeInTheDocument()

    // The croquis sits on its own page under a "Croquis" heading, and each
    // photographed waypoint gets its own page: 1 summary + 1 croquis + 4.
    expect(screen.getByText('Croquis')).toBeInTheDocument()
    expect(screen.getAllByTestId('pdf-page')).toHaveLength(6)

    // One image per photographed waypoint (4 of 5) and their back links.
    expect(screen.getAllByTestId('pdf-image')).toHaveLength(4)
    expect(screen.getAllByText(/Back to the croquis/).length).toBe(4)
    expect(screen.getByText('Rappel 1')).toBeInTheDocument()
    expect(screen.getByText('• Be careful')).toBeInTheDocument()
    // The croquis carries clickable overlays to those waypoints.
    expect(
      screen
        .getAllByRole('link')
        .filter((a) => a.getAttribute('href') === '#wp-0'),
    ).toHaveLength(1)
  })

  it('drops empty and absent fields and hides the flow when unset', () => {
    render(
      <CanyonReportDocument
        title="X"
        lang="en"
        obstacles={obstacles}
        summary={{
          kind: 'canyoning-data',
          lang: 'en',
          grade: '',
          desnivel: '150m',
        }}
      />,
    )
    expect(screen.getByText('150m')).toBeInTheDocument()
    // Empty grade is dropped, not shown as an empty cell.
    expect(screen.queryByText('DIFFICULTY')).not.toBeInTheDocument()
  })

  it('falls back to the raw flow key when it is not a known level', () => {
    render(
      <CanyonReportDocument
        title="X"
        lang="en"
        obstacles={obstacles}
        summary={{ kind: 'canyoning-data', lang: 'en', flowLevel: 'bogus' }}
      />,
    )
    expect(screen.getByText('bogus')).toBeInTheDocument()
  })

  it('omits the summary section when there is no summary', () => {
    render(
      <CanyonReportDocument
        title="X"
        lang="en"
        obstacles={obstacles}
        summary={null}
      />,
    )
    expect(screen.queryByText("That day's figures")).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Use it as a rough reference/),
    ).not.toBeInTheDocument()
  })

  it('renders no waypoint images or sections when no obstacle has photos', () => {
    const noPhotos = obstacles.map(({ photos: _photos, ...rest }) => rest)
    render(
      <CanyonReportDocument
        title=""
        lang="en"
        obstacles={noPhotos}
        summary={null}
      />,
    )
    expect(screen.queryByTestId('pdf-image')).not.toBeInTheDocument()
    expect(screen.queryByText(/Back to the croquis/)).not.toBeInTheDocument()
    // An empty title falls back to the localised report title.
    expect(screen.getAllByText('Canyon report').length).toBeGreaterThan(0)
  })

  it('localises to Spanish', () => {
    render(
      <CanyonReportDocument
        title="ES"
        lang="es"
        obstacles={obstacles}
        summary={fullSummary}
      />,
    )
    expect(screen.getByText('Datos de la salida')).toBeInTheDocument()
    expect(screen.getByText(/Úsalo como referencia/)).toBeInTheDocument()
  })
})
