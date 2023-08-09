import { render } from '@testing-library/react'

import Assets from './assets'

describe('Assets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Assets />)
    expect(baseElement).toBeTruthy()
  })
})
