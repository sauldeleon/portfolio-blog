import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PreviewSectionLabel } from './PreviewSectionLabel'

describe('PreviewSectionLabel', () => {
  it('renders children', () => {
    renderApp(<PreviewSectionLabel>Card preview</PreviewSectionLabel>)
    expect(screen.getByText('Card preview')).toBeInTheDocument()
  })

  it('renders with testid', () => {
    renderApp(<PreviewSectionLabel>Hero preview</PreviewSectionLabel>)
    expect(screen.getByTestId('preview-section-label')).toBeInTheDocument()
  })
})
