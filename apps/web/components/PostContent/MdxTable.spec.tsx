import { screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { MdxTable } from './MdxTable'

describe('MdxTable', () => {
  it('renders table with children', () => {
    renderWithTheme(
      <MdxTable>
        <tbody>
          <tr>
            <td>Cell content</td>
          </tr>
        </tbody>
      </MdxTable>,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Cell content')).toBeInTheDocument()
  })

  it('passes additional props to the table element', () => {
    renderWithTheme(
      <MdxTable data-testid="my-table">
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </MdxTable>,
    )
    expect(screen.getByTestId('my-table')).toBeInTheDocument()
  })
})
