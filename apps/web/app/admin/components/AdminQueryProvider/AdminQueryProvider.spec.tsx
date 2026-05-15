import { render, screen } from '@testing-library/react'

import { AdminQueryProvider } from './AdminQueryProvider'

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

describe('AdminQueryProvider', () => {
  it('renders children', () => {
    render(
      <AdminQueryProvider>
        <div data-testid="child">hello</div>
      </AdminQueryProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
