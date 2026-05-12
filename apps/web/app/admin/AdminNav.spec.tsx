import { fireEvent, render, screen } from '@testing-library/react'

import { AdminNav } from './AdminNav'

const mockSignOut = jest.fn()

jest.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

jest.mock('next/link', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({
      href,
      children,
    }: {
      href: string
      children: React.ReactNode
    }) => React.createElement('a', { href }, children),
  }
})

describe('AdminNav', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Posts link', () => {
    render(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'href',
      '/admin/posts',
    )
  })

  it('renders Categories link', () => {
    render(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/admin/categories',
    )
  })

  it('renders Logout button', () => {
    render(<AdminNav />)
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('clicking Logout calls signOut with correct callbackUrl', () => {
    render(<AdminNav />)
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/admin/login' })
  })
})
