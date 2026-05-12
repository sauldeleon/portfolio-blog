import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Callout } from './Callout'

describe('Callout', () => {
  it('renders type note', () => {
    renderWithTheme(<Callout type="note">Note content</Callout>)
    const el = screen.getByTestId('callout')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-type', 'note')
  })

  it('renders type warning', () => {
    renderWithTheme(<Callout type="warning">Warning content</Callout>)
    const el = screen.getByTestId('callout')
    expect(el).toHaveAttribute('data-type', 'warning')
  })

  it('renders type tip', () => {
    renderWithTheme(<Callout type="tip">Tip content</Callout>)
    const el = screen.getByTestId('callout')
    expect(el).toHaveAttribute('data-type', 'tip')
  })

  it('renders children', () => {
    renderWithTheme(<Callout type="note">Hello world</Callout>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(
      <Callout type="tip">Snapshot content</Callout>,
    )
    expect(baseElement).toMatchSnapshot()
  })
})
