import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Button } from './button'

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<Button />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with children', () => {
    renderWithTheme(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render variant contained', () => {
    renderWithTheme(<Button variant="contained">Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render variant inverted', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="inverted">Click me</Button>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant label as active', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="label" active>
        Published
      </Button>,
    )
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant label as not active', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="label" active={false}>
        Published
      </Button>,
    )
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})
