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
  activeTags: string[]
  allLabel: string
  label?: string
}

export function TagFilter({
  tags,
  activeTags,
  allLabel,
  label,
}: TagFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleToggle = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    if (next.length === 0) {
      params.delete('tags')
    } else {
      params.set('tags', next.join(','))
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tags')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <StyledFilterNav aria-label={label ?? allLabel}>
      {label ? <StyledFilterLabel>{label}</StyledFilterLabel> : null}
      <StyledChipList>
        <li>
          <StyledChip
            $small
            onClick={handleAll}
            active={activeTags.length === 0}
            aria-current={activeTags.length === 0 ? true : undefined}
          >
            {allLabel}
          </StyledChip>
        </li>
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <StyledChip
              $small
              onClick={() => handleToggle(tag)}
              active={activeTags.includes(tag)}
              aria-current={activeTags.includes(tag) ? true : undefined}
            >
              {tag} ({count})
            </StyledChip>
          </li>
        ))}
      </StyledChipList>
    </StyledFilterNav>
  )
}
