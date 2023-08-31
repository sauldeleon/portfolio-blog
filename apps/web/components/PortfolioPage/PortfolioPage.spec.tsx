import { renderApp } from '@sdlgr/test-utils'

import { PortfolioPage } from './PortfolioPage'

describe('PortfolioPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<PortfolioPage />)
    expect(baseElement).toBeTruthy()
  })
})
