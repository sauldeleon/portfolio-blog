import { waitFor } from '@testing-library/react'
import Cookies from 'js-cookie'

import { renderApp } from '@sdlgr/test-utils'

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
    const { baseElement } = renderApp(
      <LanguageContextProvider value={undefined}>test</LanguageContextProvider>
    )
    expect(baseElement).toHaveTextContent('test')
  })

  it('should render successfully store the language in a cookie', async () => {
    const { baseElement } = renderApp(
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
