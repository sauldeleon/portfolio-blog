import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PortfolioHeading } from './PortfolioHeading'

describe('PortfolioHeading', () => {
  it('should render correctly', async () => {
    const { baseElement } = renderApp(<PortfolioHeading />)
    expect(
      await screen.findByText('sauldeleonguerrero@gmail.com'),
    ).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})
