'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { startTransition, useState } from 'react'

import {
  StyledApplyButton,
  StyledChip,
  StyledChipList,
  StyledDropdownButton,
  StyledDropdownPanel,
  StyledDropdownWrapper,
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
  label?: string
  isOpen: boolean
  onToggle: () => void
  applyLabel?: string
}

export function CategoryFilter({
  categories,
  activeCategories,
  label,
  isOpen,
  onToggle,
  applyLabel,
}: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, setPending] = useState<string[]>(activeCategories)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) setPending([...activeCategories])
  }

  const hasChanges =
    [...pending].sort().join(',') !== [...activeCategories].sort().join(',')

  const handleToggle = (slug: string) => {
    setPending((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (pending.length === 0) {
      params.delete('categories')
    } else {
      params.set('categories', pending.join(','))
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
    onToggle()
  }

  const activeCount = activeCategories.length

  return (
    <StyledDropdownWrapper>
      <StyledDropdownButton
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid="filter-trigger"
      >
        {label}
        {activeCount > 0 ? ` (${activeCount})` : ''} ▾
      </StyledDropdownButton>
      {isOpen && (
        <StyledDropdownPanel>
          <StyledChipList>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <StyledChip
                  onClick={() => handleToggle(cat.slug)}
                  active={pending.includes(cat.slug)}
                  aria-current={pending.includes(cat.slug) ? true : undefined}
                >
                  {cat.name}
                </StyledChip>
              </li>
            ))}
          </StyledChipList>
          <StyledApplyButton
            variant="ghost"
            colorScheme="success"
            size="sm"
            disabled={!hasChanges}
            onClick={handleApply}
          >
            {applyLabel}
          </StyledApplyButton>
        </StyledDropdownPanel>
      )}
    </StyledDropdownWrapper>
  )
}
