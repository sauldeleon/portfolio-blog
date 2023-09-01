import { renderWithTheme } from '@sdlgr/test-utils'

import { GlobalStyles } from './GlobalStyles'

describe('GlobalStyles', () => {
  // GlobalStyle cannot be snapshot tested https://github.com/masakudamatsu/nextjs-template/issues/17
  it('should render successfully', () => {
    renderWithTheme(<GlobalStyles />)
    expect(document.head).toMatchSnapshot()
  })
})
