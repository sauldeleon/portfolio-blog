import { render, screen } from '@testing-library/react'

import AdminLayout from './layout.next'

jest.mock('./AdminNav', () => {
  const React = require('react')
  return {
    AdminNav: jest
      .fn()
      .mockReturnValue(
        React.createElement('nav', { 'data-testid': 'admin-nav' }),
      ),
  }
})

describe('AdminLayout', () => {
  it('renders the admin nav and children', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Hello</div>
      </AdminLayout>,
    )
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument()
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
