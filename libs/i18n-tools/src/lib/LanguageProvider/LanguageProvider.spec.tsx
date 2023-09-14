import { render } from '@testing-library/react'

import { LanguageContextProvider } from './LanguageProvider'

jest.mock('js-cookie', () => ({
  set: jest.fn(),
}))

describe('LanguageProvider', () => {
  beforeAll(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      <LanguageContextProvider value={undefined}>test</LanguageContextProvider>,
    )
    expect(baseElement).toHaveTextContent('test')
  })
})
