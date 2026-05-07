import { render } from '@testing-library/react'
import React from 'react'

import { SLLogo } from './assets'
import * as Icons from './assets'

describe('FireAssets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SLLogo />)
    expect(baseElement).toBeTruthy()
  })

  it('should have exports', () => {
    expect(typeof Icons).toBe('object')
  })

  it('should not have undefined exports', () => {
    Object.keys(Icons).forEach((exportKey) => {
      const keyComponent = exportKey as keyof typeof Icons
      const Component = Icons[keyComponent]
      expect(Boolean(Component)).toBe(true)
    })
  })

  it('should render all icons', () => {
    Object.values(Icons)
      .filter(
        (v): v is React.ComponentType => v != null && typeof v !== 'boolean',
      )
      .forEach((Component) => {
        const { baseElement } = render(React.createElement(Component))
        expect(baseElement).toBeTruthy()
        const { baseElement: withTitle } = render(
          React.createElement(Component, {
            title: 'Title',
            titleId: 'title-id',
          }),
        )
        expect(withTitle).toBeTruthy()
      })
  })
})
