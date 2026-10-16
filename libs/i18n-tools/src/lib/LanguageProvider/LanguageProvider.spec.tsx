import { render } from '@testing-library/react'

import { LanguageContextProvider } from './LanguageProvider'

vi.mock('js-cookie', () => ({
  set: vi.fn(),
}))

describe('LanguageProvider', () => {
  beforeAll(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <LanguageContextProvider value={undefined}>test</LanguageContextProvider>,
    )
    expect(baseElement).toHaveTextContent('test')
  })
})
