import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PreviewBanner } from './PreviewBanner'

describe('PreviewBanner', () => {
  it('renders the label text', () => {
    renderApp(<PreviewBanner label="Admin preview — draft" />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Admin preview — draft',
    )
  })
})
