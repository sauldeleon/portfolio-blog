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
  StyledTagSearchInput,
} from './BlogFilters.styles'

export interface TagWithCount {
  tag: string
  count: number
}

export interface TagFilterProps {
  tags: TagWithCount[]
  activeTags: string[]
  label?: string
  isOpen: boolean
  onToggle: () => void
  applyLabel?: string
  tagSearchPlaceholder?: string
}

const MAX_VISIBLE_TAGS = 15

export function TagFilter({
  tags,
  activeTags,
  label,
  isOpen,
  onToggle,
  applyLabel,
  tagSearchPlaceholder,
}: TagFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, setPending] = useState<string[]>(activeTags)
  const [tagSearch, setTagSearch] = useState('')
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setPending([...activeTags])
      setTagSearch('')
    }
  }

  const hasChanges =
    [...pending].sort().join(',') !== [...activeTags].sort().join(',')

  const handleToggle = (tag: string) => {
    setPending((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (pending.length === 0) {
      params.delete('tags')
    } else {
      params.set('tags', pending.join(','))
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
    onToggle()
  }

  const filteredTags = tags
    .filter(({ tag }) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .slice(0, MAX_VISIBLE_TAGS)

  const activeCount = activeTags.length

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
        <StyledDropdownPanel $wide>
          <StyledTagSearchInput
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder={tagSearchPlaceholder}
            data-testid="tag-search-input"
          />
          <StyledChipList>
            {filteredTags.map(({ tag, count }) => (
              <li key={tag}>
                <StyledChip
                  $small
                  onClick={() => handleToggle(tag)}
                  active={pending.includes(tag)}
                  aria-current={pending.includes(tag) ? true : undefined}
                >
                  {tag} ({count})
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
