import { screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import { AdminNav } from './AdminNav'

const mockLogoutAction = vi.fn()

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.posts': 'Posts',
        'nav.categories': 'Categories',
        'nav.series': 'Series',
        'nav.images': 'Images',
        'nav.cards': 'Cards',
        'nav.tracks': 'Tracks',
        'nav.comments': 'Comments',
        'nav.users': 'Users',
        'nav.logout': 'Logout',
      }
      return translations[key] ?? key
    },
  }),
}))

vi.mock('../../actions/logout', () => ({
  logoutAction: (...args: unknown[]) => mockLogoutAction(...args),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('next/link', async () => {
  const React = await import('react')
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
    vi.clearAllMocks()
    ;(usePathname as Mock).mockReturnValue('/admin/posts')
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

  it('renders Series link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Series' })).toHaveAttribute(
      'href',
      '/admin/series',
    )
  })

  it('renders Images link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Images' })).toHaveAttribute(
      'href',
      '/admin/images',
    )
  })

  it('renders Cards link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Cards' })).toHaveAttribute(
      'href',
      '/admin/cards',
    )
  })

  it('marks Cards link active when on cards route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/cards')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Cards' })).toBeInTheDocument()
  })

  it('renders Tracks link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Tracks' })).toHaveAttribute(
      'href',
      '/admin/tracks',
    )
  })

  it('marks Tracks link active when on tracks route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/tracks/edit')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Tracks' })).toBeInTheDocument()
  })

  it('renders Comments link', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Comments' })).toHaveAttribute(
      'href',
      '/admin/comments',
    )
  })

  it('marks Comments link active when on comments route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/comments')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Comments' })).toBeInTheDocument()
  })

  it('renders Logout button', () => {
    renderApp(<AdminNav />)
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('does not render Users link when role is not admin', () => {
    renderApp(<AdminNav role="editor" />)
    expect(
      screen.queryByRole('link', { name: 'Users' }),
    ).not.toBeInTheDocument()
  })

  it('does not render Users link when role is undefined', () => {
    renderApp(<AdminNav />)
    expect(
      screen.queryByRole('link', { name: 'Users' }),
    ).not.toBeInTheDocument()
  })

  it('renders Users link when role is admin', () => {
    renderApp(<AdminNav role="admin" />)
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'href',
      '/admin/users',
    )
  })

  it('marks Posts link active when on posts route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/posts/some-id')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument()
  })

  it('marks Categories link active when on categories route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/categories')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categories' })).toBeInTheDocument()
  })

  it('marks Series link active when on series route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/series')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Series' })).toBeInTheDocument()
  })

  it('marks Images link active when on images route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/images')
    renderApp(<AdminNav />)
    expect(screen.getByRole('link', { name: 'Images' })).toBeInTheDocument()
  })

  it('marks Users link active when on users route', () => {
    ;(usePathname as Mock).mockReturnValue('/admin/users')
    renderApp(<AdminNav role="admin" />)
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
  })
})
