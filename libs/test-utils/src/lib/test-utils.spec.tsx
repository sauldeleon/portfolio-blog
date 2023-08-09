import { render } from '@testing-library/react'

import TestUtils from './test-utils'

describe('TestUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TestUtils />)
    expect(baseElement).toBeTruthy()
  })
})
