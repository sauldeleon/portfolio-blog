import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { StyledDropdownPanel } from './Dropdown.styles'

describe('StyledDropdownPanel', () => {
  it('renders children', () => {
    renderWithTheme(<StyledDropdownPanel>panel content</StyledDropdownPanel>)
    expect(screen.getByText('panel content')).toBeInTheDocument()
  })
})
