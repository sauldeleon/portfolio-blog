'use client'

import { useEffect, useRef, useState } from 'react'

import { ActiveFilters } from './ActiveFilters'
import { StyledBlogFilters, StyledFilterRow } from './BlogFilters.styles'
import { type Category, CategoryFilter } from './CategoryFilter'
import { DateFilter, type DateGroup } from './DateFilter'
import { SearchInput } from './SearchInput'
import { TagFilter, type TagWithCount } from './TagFilter'

export interface BlogFiltersProps {
  categories: Category[]
  activeCategories: string[]
  categoriesLabel?: string

  tags: TagWithCount[]
  activeTags: string[]
  tagsLabel?: string

  dates: DateGroup[]
  activeYear: number | null
  activeMonth: number | null
  dateLabel?: string
  monthNames: string[]

  searchPlaceholder?: string
  initialQ?: string
  applyLabel?: string
  clearAllLabel?: string
  tagSearchPlaceholder?: string
}

export function BlogFilters({
  categories,
  activeCategories,
  categoriesLabel,
  tags,
  activeTags,
  tagsLabel,
  dates,
  activeYear,
  activeMonth,
  dateLabel,
  monthNames,
  searchPlaceholder,
  initialQ,
  applyLabel,
  clearAllLabel,
  tagSearchPlaceholder,
}: BlogFiltersProps) {
  const [openFilter, setOpenFilter] = useState<
    'category' | 'tag' | 'date' | null
  >(null)
  const filterRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterRowRef.current &&
        !filterRowRef.current.contains(e.target as Node)
      ) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleFilter = (filter: 'category' | 'tag' | 'date') => {
    setOpenFilter((prev) => (prev === filter ? null : filter))
  }

  return (
    <StyledBlogFilters>
      <SearchInput placeholder={searchPlaceholder} initialValue={initialQ} />
      <StyledFilterRow ref={filterRowRef}>
        <CategoryFilter
          categories={categories}
          activeCategories={activeCategories}
          label={categoriesLabel}
          isOpen={openFilter === 'category'}
          onToggle={() => toggleFilter('category')}
          applyLabel={applyLabel}
        />
        <TagFilter
          tags={tags}
          activeTags={activeTags}
          label={tagsLabel}
          isOpen={openFilter === 'tag'}
          onToggle={() => toggleFilter('tag')}
          applyLabel={applyLabel}
          tagSearchPlaceholder={tagSearchPlaceholder}
        />
        <DateFilter
          dates={dates}
          activeYear={activeYear}
          activeMonth={activeMonth}
          label={dateLabel}
          monthNames={monthNames}
          isOpen={openFilter === 'date'}
          onToggle={() => toggleFilter('date')}
        />
      </StyledFilterRow>
      <ActiveFilters
        activeCategories={activeCategories}
        categories={categories}
        activeTags={activeTags}
        activeYear={activeYear}
        activeMonth={activeMonth}
        dates={dates}
        monthNames={monthNames}
        clearAllLabel={clearAllLabel}
      />
    </StyledBlogFilters>
  )
}
