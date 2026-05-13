import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { TagFilter } from './TagFilter'

const mockPush = jest.fn()

const tags = [
  { tag: 'react', count: 10 },
  { tag: 'typescript', count: 7 },
]

describe('TagFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('renders all-tags label', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTag={null}
        allLabel="All tags"
        label="tag"
      />,
    )
    expect(screen.getByText('All tags')).toBeInTheDocument()
  })

  it('renders tags with counts', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTag={null} allLabel="All tags" />,
    )
    expect(screen.getByText('react (10)')).toBeInTheDocument()
    expect(screen.getByText('typescript (7)')).toBeInTheDocument()
  })

  it('clicking a tag chip pushes URL with tag param', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTag={null} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?tag=react')
  })

  it('clicking all chip removes tag param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tag=react'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTag="react" allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('All tags'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('marks active tag with aria-current', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTag="react" allLabel="All tags" />,
    )
    expect(screen.getByText('react (10)')).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('clears page param when a tag is selected', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=2'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTag={null} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?tag=react')
  })

  it('renders only all-label when no tags', () => {
    renderWithTheme(<TagFilter tags={[]} activeTag={null} allLabel="All" />)
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
