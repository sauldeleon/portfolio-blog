import { screen, waitFor } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PortfolioItem } from './PortfolioItem'

describe('PortfolioHeading', () => {
  it('should render correctly', async () => {
    const { baseElement } = renderApp(
      <PortfolioItem title="title" children={undefined} />,
    )
    await waitFor(() => expect(screen.getByText('title')).toBeInTheDocument())
    expect(baseElement).toMatchSnapshot()
  })
})
