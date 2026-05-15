'use client'

import { usePathname } from 'next/navigation'

import { useClientTranslation } from '@web/i18n/client'

import { logoutAction } from '../../actions/logout'
import {
  StyledBrand,
  StyledDivider,
  StyledLogoutButton,
  StyledNav,
  StyledNavLink,
} from './AdminNav.styles'

export function AdminNav() {
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
        href="/admin/images"
        $active={pathname.startsWith('/admin/images')}
      >
        {t('nav.images')}
      </StyledNavLink>
      <StyledDivider aria-hidden />
      <form action={logoutAction}>
        <StyledLogoutButton type="submit">{t('nav.logout')}</StyledLogoutButton>
      </form>
    </StyledNav>
  )
}
