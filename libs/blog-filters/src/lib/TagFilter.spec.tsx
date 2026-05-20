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
      <TagFilter tags={tags} activeTags={[]} allLabel="All tags" label="tag" />,
    )
    expect(screen.getByText('All tags')).toBeInTheDocument()
  })

  it('renders tags with counts', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTags={[]} allLabel="All tags" />,
    )
    expect(screen.getByText('react (10)')).toBeInTheDocument()
    expect(screen.getByText('typescript (7)')).toBeInTheDocument()
  })

  it('clicking a tag chip adds it to URL tags param', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTags={[]} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?tags=react')
  })

  it('clicking an active tag chip removes it from URL', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTags={['react']} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('clicking a second tag appends to existing selection', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTags={['react']} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('typescript (7)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?tags=react%2Ctypescript')
  })

  it('clicking all chip removes tags param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTags={['react']} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('All tags'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?')
  })

  it('marks active tags with aria-current', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTags={['react']} allLabel="All tags" />,
    )
    expect(screen.getByText('react (10)')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByText('typescript (7)')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks all as active when no tags selected', () => {
    renderWithTheme(
      <TagFilter tags={tags} activeTags={[]} allLabel="All tags" />,
    )
    expect(screen.getByText('All tags')).toHaveAttribute('aria-current', 'true')
  })

  it('clears page param when a tag is toggled', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=2'),
    )
    renderWithTheme(
      <TagFilter tags={tags} activeTags={[]} allLabel="All tags" />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?tags=react')
  })

  it('renders only all-label when no tags', () => {
    renderWithTheme(<TagFilter tags={[]} activeTags={[]} allLabel="All" />)
    expect(screen.getByText('All')).toBeInTheDocument()
  })
})
