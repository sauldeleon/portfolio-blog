import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { CircleLink } from './circle-link'

describe('CircleLink', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<CircleLink href="" />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with a label', () => {
    renderWithTheme(<CircleLink label="test" href="" />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('should render with a label inside the icon', () => {
    renderWithTheme(<CircleLink label="test" iconContent="wadus" href="" />)
    expect(screen.getByText('wadus')).toBeInTheDocument()
  })

  it('should render with a different size', () => {
    const { baseElement } = renderWithTheme(
      <CircleLink label="test" iconContent="wadus" iconSize={50} href="" />,
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should render a link with given props', () => {
    renderWithTheme(
      <CircleLink
        label="test"
        iconContent="wadus"
        iconSize={50}
        href="/path"
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '/path')
  })
})
