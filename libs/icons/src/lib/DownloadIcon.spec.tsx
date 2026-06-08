import { render } from '@testing-library/react'

import { DownloadIcon } from './DownloadIcon'

describe('DownloadIcon', () => {
  it('renders', () => {
    const { asFragment } = render(<DownloadIcon />)
    expect(asFragment()).toMatchSnapshot()
  })
})
