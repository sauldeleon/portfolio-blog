import { render, waitFor } from '@testing-library/react'
import Cookies from 'js-cookie'

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
      <LanguageContextProvider value={undefined}>test</LanguageContextProvider>
    )
    expect(baseElement).toHaveTextContent('test')
  })

  it('should render successfully store the language in a cookie', async () => {
    const { baseElement } = render(
      <LanguageContextProvider value={{ language: 'en' }}>
        test
      </LanguageContextProvider>
    )
    expect(baseElement).toHaveTextContent('test')

    await waitFor(() =>
      expect(Cookies.set).toHaveBeenNthCalledWith(1, 'i18nextLng', 'en')
    )
  })
})
