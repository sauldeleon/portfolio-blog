import { render } from '@testing-library/react'

import { NoteIcon } from './NoteIcon'

describe('NoteIcon', () => {
  it('renders', () => {
    const { asFragment } = render(<NoteIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
