'use client'

import { usePathname } from 'next/navigation'

import { useClientTranslation } from '@web/i18n/client'
import type { UserRole } from '@web/lib/db/schema'

import { logoutAction } from '../../actions/logout'
import {
  StyledBrand,
  StyledDivider,
  StyledLogoutButton,
  StyledNav,
  StyledNavLink,
} from './AdminNav.styles'

interface AdminNavProps {
  role?: UserRole
}

export function AdminNav({ role }: AdminNavProps) {
  const { t } = useClientTranslation('admin')
  const pathname = usePathname()

  return (
    <StyledNav data-testid="admin-nav">
      <StyledBrand aria-hidden>Admin</StyledBrand>
      <StyledNavLink
        href="/admin/posts"
        $active={pathname.startsWith('/admin/posts')}
      >
        {t('nav.posts')}
      </StyledNavLink>
      <StyledNavLink
        href="/admin/categories"
        $active={pathname.startsWith('/admin/categories')}
      >
        {t('nav.categories')}
      </StyledNavLink>
      <StyledNavLink
        href="/admin/series"
        $active={pathname.startsWith('/admin/series')}
      >
        {t('nav.series')}
      </StyledNavLink>
      <StyledNavLink
        href="/admin/images"
        $active={pathname.startsWith('/admin/images')}
      >
        {t('nav.images')}
      </StyledNavLink>
      <StyledNavLink
        href="/admin/comments"
        $active={pathname.startsWith('/admin/comments')}
      >
        {t('nav.comments')}
      </StyledNavLink>
      {role === 'admin' && (
        <StyledNavLink
          href="/admin/users"
          $active={pathname.startsWith('/admin/users')}
        >
          {t('nav.users')}
        </StyledNavLink>
      )}
      <StyledDivider aria-hidden />
      <form action={logoutAction}>
        <StyledLogoutButton type="submit">{t('nav.logout')}</StyledLogoutButton>
      </form>
    </StyledNav>
  )
}
