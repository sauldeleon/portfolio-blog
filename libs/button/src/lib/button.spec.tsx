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
})
