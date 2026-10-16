import * as ReactPdf from '@react-pdf/renderer'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import type { CroquisObstacle } from '@web/lib/cards'

import { CroquisReportButton } from './CroquisReportButton'

// Test hooks the mocked '@react-pdf/renderer' exposes (see __mocks__).
const { __setMockPdf, __resetMockPdf } = ReactPdf as unknown as {
  __setMockPdf: (next: { url?: string | null; loading?: boolean }) => void
  __resetMockPdf: () => void
}

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const obstacles: CroquisObstacle[] = [
  {
    type: 'salto',
    title: 'Jump',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
  } as unknown as CroquisObstacle,
]

describe('CroquisReportButton', () => {
  beforeEach(() => {
    __resetMockPdf()
  })

  it('downloads the report PDF with a file-base and language filename', async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('canyon-report-barranco-x-es.pdf')
      })
    renderApp(
      <CroquisReportButton
        title="Barranco X"
        lang="es"
        obstacles={obstacles}
        summary={null}
        fileBase="barranco-x"
      />,
    )
    const button = screen.getByTestId('post-croquis-report')
    expect(button).toHaveTextContent('croquis.downloadReport')
    await userEvent.click(button)
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('disables the button while the PDF is generating', () => {
    __setMockPdf({ loading: true, url: null })
    renderApp(
      <CroquisReportButton
        lang="en"
        obstacles={obstacles}
        summary={null}
        fileBase="croquis"
      />,
    )
    const button = screen.getByTestId('post-croquis-report')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('croquis.generatingReport')
  })
})
