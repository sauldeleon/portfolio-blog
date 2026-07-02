import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PostContentCroquis } from './PostContentCroquis'

jest.mock('@web/components/Croquis', () => ({
  CroquisMap: ({ obstacles, lang }: { obstacles: unknown[]; lang: string }) => (
    <div data-testid="croquis-map-mock">
      <span data-testid="cm-count">{obstacles.length}</span>
      <span data-testid="cm-lang">{lang}</span>
    </div>
  ),
}))

let mockLanguage = 'en'
jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ i18n: { language: mockLanguage } }),
}))

const OB = JSON.stringify([
  {
    type: 'salto',
    title: 'Jump',
    meters: 5,
    side: null,
    severity: 'easy',
    notes: [],
  },
])

describe('PostContentCroquis', () => {
  beforeEach(() => {
    mockLanguage = 'en'
  })

  it('renders nothing without obstacles', () => {
    renderApp(<PostContentCroquis />)
    expect(screen.queryByTestId('post-croquis')).not.toBeInTheDocument()
  })

  it('renders nothing for an empty obstacle list', () => {
    renderApp(<PostContentCroquis obstacles="[]" />)
    expect(screen.queryByTestId('post-croquis')).not.toBeInTheDocument()
  })

  it('renders the map with the parsed obstacles', () => {
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('post-croquis')).toBeInTheDocument()
    expect(screen.getByTestId('cm-count')).toHaveTextContent('1')
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('en')
  })

  it('passes the Spanish language through', () => {
    mockLanguage = 'es'
    renderApp(<PostContentCroquis obstacles={OB} />)
    expect(screen.getByTestId('cm-lang')).toHaveTextContent('es')
  })
})
