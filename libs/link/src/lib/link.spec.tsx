import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { Link } from './link'

describe('Link', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Link href="/contact/" />)

    expect(baseElement).toMatchSnapshot()
  })

  it('should render a next/link for relative paths', () => {
    renderApp(<Link href="/contact/" />)

    expect(screen.queryByTestId('plain-anchor')).not.toBeInTheDocument()
  })

  it('should render an anchor for absolute paths', () => {
    renderApp(<Link href="https://www.google.com" />)

    expect(screen.getByTestId('plain-anchor')).toBeInTheDocument()
  })

  it('should force an anchor tag not next link', () => {
    renderApp(<Link href="/contact/" forceAnchor />)

    expect(screen.getByTestId('plain-anchor')).toBeInTheDocument()
  })
})
