import { render } from '@testing-library/react'

import { MapPinIcon } from './MapPinIcon'

describe('MapPinIcon', () => {
  it('renders', () => {
    const { asFragment } = render(<MapPinIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
