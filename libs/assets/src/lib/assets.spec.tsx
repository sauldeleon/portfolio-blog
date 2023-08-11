import { render } from '@testing-library/react'

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
})
