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

  it('should render variant inverted with size sm', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="inverted" size="sm">
        Click me
      </Button>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant inverted with size lg', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="inverted" size="lg">
        Click me
      </Button>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant contained with size sm', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="contained" size="sm">
        Click me
      </Button>,
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

  it('should render variant ghost', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="ghost">Action</Button>,
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant ghost with size xs', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="ghost" size="xs">
        Action
      </Button>,
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant ghost with size sm', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="ghost" size="sm">
        Action
      </Button>,
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render variant ghost with size lg', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="ghost" size="lg">
        Action
      </Button>,
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render contained with size xs', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="contained" size="xs">
        Click me
      </Button>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render inverted with size xs', () => {
    const { baseElement } = renderWithTheme(
      <Button variant="inverted" size="xs">
        Click me
      </Button>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})
