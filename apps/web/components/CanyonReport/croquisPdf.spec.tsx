import { render, screen } from '@testing-library/react'

import type { CroquisObstacle } from '@web/lib/cards'

import { CroquisPdf } from './croquisPdf'

const salto: CroquisObstacle = {
  type: 'salto',
  title: 'Jump',
  meters: 5,
  side: null,
  severity: 'easy',
  notes: [],
}
const rapel: CroquisObstacle = {
  type: 'rapel',
  title: 'Rappel',
  meters: 10,
  side: 'left',
  severity: 'danger',
  notes: [],
}

describe('CroquisPdf', () => {
  it('draws the panel, header and access/exit marks with a title', () => {
    render(
      <CroquisPdf
        obstacles={[salto, rapel]}
        lang="en"
        title="Barranco X"
        width={500}
        linkable={new Set([0])}
      />,
    )
    expect(screen.getByTestId('pdf-svg')).toBeInTheDocument()
    expect(screen.getAllByTestId('pdf-path').length).toBeGreaterThan(0)
    expect(screen.getByText('CROQUIS')).toBeInTheDocument()
    expect(screen.getByText('Barranco X')).toBeInTheDocument()
    expect(screen.getByText('ACCESS')).toBeInTheDocument()
    expect(screen.getByText('EXIT')).toBeInTheDocument()
    // Only the linkable node (0) gets a jump link.
    const links = screen.getAllByTestId('pdf-link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '#wp-0')
  })

  it('omits the header when no title is given', () => {
    render(
      <CroquisPdf
        obstacles={[salto]}
        lang="en"
        width={500}
        linkable={new Set()}
      />,
    )
    expect(screen.queryByText('CROQUIS')).not.toBeInTheDocument()
    expect(screen.getByText('ACCESS')).toBeInTheDocument()
    expect(screen.queryAllByTestId('pdf-link')).toHaveLength(0)
  })

  it('renders an empty panel without nodes', () => {
    render(
      <CroquisPdf obstacles={[]} lang="en" width={500} linkable={new Set()} />,
    )
    expect(screen.getByTestId('pdf-svg')).toBeInTheDocument()
    expect(screen.queryByText('ACCESS')).not.toBeInTheDocument()
  })

  it('draws tobogán and split (salto-rapel) glyphs and meta variants', () => {
    const obstacles: CroquisObstacle[] = [
      {
        type: 'tobogan',
        title: 'Slide',
        meters: null,
        side: null,
        severity: 'caution',
        notes: [],
      },
      {
        type: 'salto-rapel',
        title: 'Split',
        meters: 8,
        side: 'right',
        severity: 'easy',
        notes: [],
      },
    ]
    render(
      <CroquisPdf
        obstacles={obstacles}
        lang="es"
        title="Combo"
        width={500}
        linkable={new Set([1])}
      />,
    )
    // Right-side meta annotation for the split.
    expect(screen.getByText(/DCHA/)).toBeInTheDocument()
  })

  it('serpentines into rows with return connectors past the single-line max', () => {
    const many: CroquisObstacle[] = Array.from({ length: 12 }, (_, i) => ({
      type: 'rapel',
      title: `R${i}`,
      meters: 12,
      side: 'left',
      severity: 'easy',
      notes: [],
    }))
    render(
      <CroquisPdf
        obstacles={many}
        lang="en"
        width={500}
        linkable={new Set()}
      />,
    )
    // Left-side meta annotation and a dense set of segment paths.
    expect(screen.getAllByText(/LEFT/).length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('pdf-path').length).toBeGreaterThan(12)
  })

  it('scales down to fit a max height and keeps the jump links', () => {
    const many: CroquisObstacle[] = Array.from({ length: 12 }, (_, i) => ({
      type: 'rapel',
      title: `R${i}`,
      meters: 12,
      side: null,
      severity: 'easy',
      notes: [],
    }))
    render(
      <CroquisPdf
        obstacles={many}
        lang="en"
        title="Tall"
        width={500}
        maxHeight={120}
        linkable={new Set([0, 5])}
      />,
    )
    expect(screen.getByTestId('pdf-svg')).toBeInTheDocument()
    expect(screen.getAllByTestId('pdf-link')).toHaveLength(2)
  })
})
