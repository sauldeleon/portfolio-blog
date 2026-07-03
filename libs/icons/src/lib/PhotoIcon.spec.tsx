import { render } from '@testing-library/react'

import { PhotoIcon } from './PhotoIcon'

describe('PhotoIcon', () => {
  it('renders', () => {
    const { asFragment } = render(<PhotoIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
