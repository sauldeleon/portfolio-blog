'use client'

import { useEffect, useRef, useState } from 'react'

import {
  StyledLink,
  StyledList,
  StyledNav,
  StyledTitle,
} from './TableOfContents.styles'

export interface TocEntry {
  depth: number
  text: string
  id: string
}

export interface TableOfContentsProps {
  entries: TocEntry[]
  label: string
}

export function TableOfContents({ entries, label }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (entries.length === 0) return

    const handleIntersect = (intersections: IntersectionObserverEntry[]) => {
      const visible = intersections.filter((e) => e.isIntersecting)
      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '0px 0px -70% 0px',
    })

    entries.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current!.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <StyledNav aria-label={label}>
      <StyledTitle>{label}</StyledTitle>
      <StyledList>
        {entries.map(({ id, text, depth }) => (
          <li key={id}>
            <StyledLink
              href={`#${id}`}
              $depth={depth}
              $active={activeId === id}
              aria-current={activeId === id ? 'location' : undefined}
            >
              {text}
            </StyledLink>
          </li>
        ))}
      </StyledList>
    </StyledNav>
  )
}
