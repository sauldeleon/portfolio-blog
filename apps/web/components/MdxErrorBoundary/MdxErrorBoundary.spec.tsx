import { render, screen } from '@testing-library/react'
import type { MockInstance } from 'vitest'

import { MdxErrorBoundary } from './MdxErrorBoundary'

function Boom(): never {
  throw new Error('render failed')
}

describe('MdxErrorBoundary', () => {
  let consoleError: MockInstance

  beforeEach(() => {
    // React logs caught render errors; silence to keep the test output clean.
    consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('renders its children when nothing throws', () => {
    render(
      <MdxErrorBoundary>
        <span data-testid="child">ok</span>
      </MdxErrorBoundary>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders nothing when a child throws', () => {
    const { container } = render(
      <MdxErrorBoundary>
        <Boom />
      </MdxErrorBoundary>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a custom fallback when a child throws', () => {
    render(
      <MdxErrorBoundary fallback={<span data-testid="fallback">nope</span>}>
        <Boom />
      </MdxErrorBoundary>,
    )
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })
})
