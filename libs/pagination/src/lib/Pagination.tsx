'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { StyledNav, StyledPageButton } from './Pagination.styles'

export interface PaginationProps {
  total: number
  page: number
  limit: number
  previousLabel: string
  nextLabel: string
}

export function Pagination({
  total,
  page,
  limit,
  previousLabel,
  nextLabel,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <StyledNav aria-label="pagination">
      <StyledPageButton disabled={page <= 1} onClick={() => goToPage(page - 1)}>
        {previousLabel}
      </StyledPageButton>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <StyledPageButton
          key={p}
          $current={p === page}
          onClick={() => goToPage(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </StyledPageButton>
      ))}
      <StyledPageButton
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        {nextLabel}
      </StyledPageButton>
    </StyledNav>
  )
}
