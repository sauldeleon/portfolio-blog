'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  StyledChip,
  StyledChipList,
  StyledFilterLabel,
  StyledFilterNav,
} from './BlogFilters.styles'

export interface TagWithCount {
  tag: string
  count: number
}

export interface TagFilterProps {
  tags: TagWithCount[]
  activeTag: string | null
  allLabel: string
  label?: string
}

export function TagFilter({
  tags,
  activeTag,
  allLabel,
  label,
}: TagFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSelect = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set('tag', tag)
    } else {
      params.delete('tag')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <StyledFilterNav aria-label={label ?? allLabel}>
      {label ? <StyledFilterLabel>{label}</StyledFilterLabel> : null}
      <StyledChipList>
        <li>
          <StyledChip
            onClick={() => handleSelect(null)}
            active={activeTag === null}
            aria-current={activeTag === null ? true : undefined}
          >
            {allLabel}
          </StyledChip>
        </li>
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <StyledChip
              onClick={() => handleSelect(tag)}
              active={tag === activeTag}
              aria-current={tag === activeTag ? true : undefined}
            >
              {tag} ({count})
            </StyledChip>
          </li>
        ))}
      </StyledChipList>
    </StyledFilterNav>
  )
}
