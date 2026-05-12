import { fireEvent, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { AdminNav } from './AdminNav'

const mockSignOut = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.posts': 'Posts',
        'nav.categories': 'Categories',
        'nav.logout': 'Logout',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
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
    ;(usePathname as jest.Mock).mockReturnValue('/admin/posts')
  })

  it('renders Posts link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'href',
      '/admin/posts',
    )
  })

  it('renders Categories link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/admin/categories',
    )
  })

  it('renders Logout button', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('clicking Logout calls signOut with correct callbackUrl', () => {
    renderApp(<AdminNav />)
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/admin/login' })
  })

  it('marks Posts link active when on posts route', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/admin/posts/some-id')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument()
  })

  it('marks Categories link active when on categories route', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/admin/categories')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument()
  })
})
