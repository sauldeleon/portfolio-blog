'use client'

import { Pagination } from '@sdlgr/pagination'

import { ADMIN_PAGE_SIZE } from '@web/app/admin/(auth)/hooks/useUrlPagination'
import { useClientTranslation } from '@web/i18n/client'

export interface AdminPaginationProps {
  /** Number of items after filtering. */
  total: number
  /** Current page, from `useUrlPagination`. */
  page: number
}

/** Page links under every admin list; pair with `useUrlPagination`. */
export function AdminPagination({ total, page }: AdminPaginationProps) {
  const { t } = useClientTranslation('admin')
  return (
    <Pagination
      total={total}
      page={page}
      limit={ADMIN_PAGE_SIZE}
      previousLabel={t('pagination.previous')}
      nextLabel={t('pagination.next')}
    />
  )
}
