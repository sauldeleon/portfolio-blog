'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/** Rows per page in every admin list. */
export const ADMIN_PAGE_SIZE = 20

/**
 * Client-side pagination of an already-loaded list, with the current page
 * kept in the URL (`?page=`) so refresh and back/forward keep it. Pair with
 * `<AdminPagination>`, which writes that parameter.
 */
export function useUrlPagination<T>(
  items: T[],
  perPage: number = ADMIN_PAGE_SIZE,
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const requested = parseInt(searchParams.get('page') ?? '1', 10) || 1
  const page = Math.min(Math.max(1, requested), totalPages)
  const pageItems = items.slice((page - 1) * perPage, page * perPage)

  /** Back to the first page (e.g. after a new search), keeping other params. */
  function resetPage() {
    if (!searchParams.get('page')) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return { page, pageItems, resetPage }
}
