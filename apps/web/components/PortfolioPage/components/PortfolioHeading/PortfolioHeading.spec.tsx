import { screen, waitFor } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PortfolioHeading } from './PortfolioHeading'

describe('PortfolioHeading', () => {
  it('should render correctly', async () => {
    const { baseElement } = renderApp(<PortfolioHeading />)
    await waitFor(() =>
      expect(
        screen.getByText('sauldeleonguerrero@gmail.com'),
      ).toBeInTheDocument(),
    )
    expect(baseElement).toMatchSnapshot()
  })
})
