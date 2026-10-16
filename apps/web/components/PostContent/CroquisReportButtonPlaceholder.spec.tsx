import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CroquisReportButtonPlaceholder } from './CroquisReportButtonPlaceholder'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

describe('CroquisReportButtonPlaceholder', () => {
  it('renders a disabled button in the generating state', () => {
    renderApp(<CroquisReportButtonPlaceholder />)
    const button = screen.getByTestId('post-croquis-report')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('croquis.generatingReport')
  })
})
