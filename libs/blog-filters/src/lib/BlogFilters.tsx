'use client'

import { StyledBlogFilters, StyledFilterByLabel } from './BlogFilters.styles'
import { type Category, CategoryFilter } from './CategoryFilter'
import { DateFilter, type DateGroup } from './DateFilter'
import { SearchInput } from './SearchInput'
import { TagFilter, type TagWithCount } from './TagFilter'

export interface BlogFiltersProps {
  categories: Category[]
  activeCategories: string[]
  allCategoriesLabel: string
  categoriesLabel?: string

  tags: TagWithCount[]
  activeTags: string[]
  allTagsLabel: string
  tagsLabel?: string

  dates: DateGroup[]
  activeYear: number | null
  activeMonth: number | null
  dateLabel?: string
  monthNames: string[]

  searchPlaceholder?: string
  initialQ?: string
  filterByLabel?: string
}

export function BlogFilters({
  categories,
  activeCategories,
  allCategoriesLabel,
  categoriesLabel,
  tags,
  activeTags,
  allTagsLabel,
  tagsLabel,
  dates,
  activeYear,
  activeMonth,
  dateLabel,
  monthNames,
  searchPlaceholder,
  initialQ,
  filterByLabel,
}: BlogFiltersProps) {
  return (
    <StyledBlogFilters>
      {filterByLabel && (
        <StyledFilterByLabel>{filterByLabel}</StyledFilterByLabel>
      )}
      <SearchInput placeholder={searchPlaceholder} initialValue={initialQ} />
      <CategoryFilter
        categories={categories}
        activeCategories={activeCategories}
        allLabel={allCategoriesLabel}
        label={categoriesLabel}
      />
      <TagFilter
        tags={tags}
        activeTags={activeTags}
        allLabel={allTagsLabel}
        label={tagsLabel}
      />
      <DateFilter
        dates={dates}
        activeYear={activeYear}
        activeMonth={activeMonth}
        label={dateLabel}
        monthNames={monthNames}
      />
    </StyledBlogFilters>
  )
}
