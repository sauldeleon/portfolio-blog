import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PortfolioItem } from './PortfolioItem'

describe('PortfolioHeading', () => {
  it('should render correctly', async () => {
    const { baseElement } = renderApp(
      <PortfolioItem title="title">text</PortfolioItem>,
    )
    expect(await screen.findByText('title')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})
