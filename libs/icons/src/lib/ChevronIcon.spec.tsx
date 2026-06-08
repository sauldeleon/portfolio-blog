import { render } from '@testing-library/react'

import { ChevronIcon } from './ChevronIcon'

describe('ChevronIcon', () => {
  it('renders', () => {
    const { asFragment } = render(<ChevronIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
