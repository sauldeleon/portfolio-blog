'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  StyledChip,
  StyledChipList,
  StyledFilterLabel,
  StyledFilterNav,
} from './BlogFilters.styles'

export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
}

export interface CategoryFilterProps {
  categories: Category[]
  activeCategories: string[]
  allLabel: string
  label?: string
}

export function CategoryFilter({
  categories,
  activeCategories,
  allLabel,
  label,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleToggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const next = activeCategories.includes(slug)
      ? activeCategories.filter((s) => s !== slug)
      : [...activeCategories, slug]
    if (next.length === 0) {
      params.delete('categories')
    } else {
      params.set('categories', next.join(','))
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('categories')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <StyledFilterNav aria-label={label ?? allLabel}>
      {label ? <StyledFilterLabel>{label}</StyledFilterLabel> : null}
      <StyledChipList>
        <li>
          <StyledChip
            onClick={handleAll}
            active={activeCategories.length === 0}
            aria-current={activeCategories.length === 0 ? true : undefined}
          >
            {allLabel}
          </StyledChip>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <StyledChip
              onClick={() => handleToggle(cat.slug)}
              active={activeCategories.includes(cat.slug)}
              aria-current={
                activeCategories.includes(cat.slug) ? true : undefined
              }
            >
              {cat.name}
            </StyledChip>
          </li>
        ))}
      </StyledChipList>
    </StyledFilterNav>
  )
}
