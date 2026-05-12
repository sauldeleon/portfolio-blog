'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { StyledChip, StyledChipList } from './BlogFilters.styles'

export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
}

export interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string | null
  allLabel: string
}

export function CategoryFilter({
  categories,
  activeCategory,
  allLabel,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <nav aria-label={allLabel}>
      <StyledChipList>
        <li>
          <StyledChip
            onClick={() => handleSelect(null)}
            $active={activeCategory === null}
            aria-current={activeCategory === null ? true : undefined}
          >
            {allLabel}
          </StyledChip>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <StyledChip
              onClick={() => handleSelect(cat.slug)}
              $active={cat.slug === activeCategory}
              aria-current={cat.slug === activeCategory ? true : undefined}
            >
              {cat.name}
            </StyledChip>
          </li>
        ))}
      </StyledChipList>
    </nav>
  )
}
