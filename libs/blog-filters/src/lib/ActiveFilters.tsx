'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { startTransition } from 'react'

import {
  StyledActiveChip,
  StyledActiveFiltersRow,
  StyledClearAllButton,
} from './BlogFilters.styles'
import type { Category } from './CategoryFilter'
import type { DateGroup } from './DateFilter'

export interface ActiveFiltersProps {
  activeCategories: string[]
  categories: Category[]
  activeTags: string[]
  activeYear: number | null
  activeMonth: number | null
  dates: DateGroup[]
  monthNames: string[]
  clearAllLabel?: string
}

export function ActiveFilters({
  activeCategories,
  categories,
  activeTags,
  activeYear,
  activeMonth,
  monthNames,
  clearAllLabel,
}: ActiveFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasAny =
    activeCategories.length > 0 || activeTags.length > 0 || activeYear !== null

  if (!hasAny) return null

  const replace = (params: URLSearchParams) => {
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const removeCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const next = activeCategories.filter((s) => s !== slug)
    if (next.length === 0) params.delete('categories')
    else params.set('categories', next.join(','))
    replace(params)
  }

  const removeTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const next = activeTags.filter((t) => t !== tag)
    if (next.length === 0) params.delete('tags')
    else params.set('tags', next.join(','))
    replace(params)
  }

  const removeDate = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('year')
    params.delete('month')
    replace(params)
  }

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('categories')
    params.delete('tags')
    params.delete('year')
    params.delete('month')
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug

  const dateLabel = activeYear
    ? activeMonth
      ? `${activeYear} › ${monthNames[activeMonth - 1]}`
      : String(activeYear)
    : null

  return (
    <StyledActiveFiltersRow data-testid="active-filters">
      {activeCategories.map((slug) => (
        <StyledActiveChip
          key={slug}
          onClick={() => removeCategory(slug)}
          data-testid={`remove-category-${slug}`}
        >
          {categoryName(slug)} ×
        </StyledActiveChip>
      ))}
      {activeTags.map((tag) => (
        <StyledActiveChip
          key={tag}
          onClick={() => removeTag(tag)}
          data-testid={`remove-tag-${tag}`}
        >
          {tag} ×
        </StyledActiveChip>
      ))}
      {dateLabel && (
        <StyledActiveChip onClick={removeDate} data-testid="remove-date">
          {dateLabel} ×
        </StyledActiveChip>
      )}
      <StyledClearAllButton onClick={clearAll} data-testid="clear-all-filters">
        {clearAllLabel}
      </StyledClearAllButton>
    </StyledActiveFiltersRow>
  )
}
