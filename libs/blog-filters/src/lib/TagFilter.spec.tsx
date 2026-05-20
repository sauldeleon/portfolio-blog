import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ThemeProvider } from 'styled-components'

import { mainTheme } from '@sdlgr/main-theme'
import { renderWithTheme } from '@sdlgr/test-utils'

import { TagFilter } from './TagFilter'

const mockReplace = jest.fn()
const mockOnToggle = jest.fn()

const tags = [
  { tag: 'react', count: 10 },
  { tag: 'typescript', count: 7 },
]

describe('TagFilter', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    mockOnToggle.mockClear()
    mockReplace.mockClear()
  })

  it('renders the dropdown button with label', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        label="Tags"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('Tags')
  })

  it('shows active count in button label', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react', 'typescript']}
        label="Tags"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveTextContent('Tags (2)')
  })

  it('does not show count when no active tags', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        label="Tags"
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).not.toHaveTextContent('(')
  })

  it('calls onToggle when button is clicked', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.click(screen.getByTestId('filter-trigger'))
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('sets aria-expanded=true when open', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('sets aria-expanded=false when closed', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByTestId('filter-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('does not render panel when closed', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={false}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.queryByText('react (10)')).not.toBeInTheDocument()
  })

  it('renders tag chips with counts in panel when open', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('react (10)')).toBeInTheDocument()
    expect(screen.getByText('typescript (7)')).toBeInTheDocument()
  })

  it('apply button is disabled when no pending changes', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    expect(screen.getByText('Apply')).toBeDisabled()
  })

  it('apply button is enabled after toggling a chip', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(screen.getByText('Apply')).not.toBeDisabled()
  })

  it('deselecting all chips enables apply button', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    expect(screen.getByText('Apply')).not.toBeDisabled()
  })

  it('clicking apply pushes URL with pending tags and calls onToggle', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('typescript (7)'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith(
      '/en/blog?tags=react%2Ctypescript',
      {
        scroll: false,
      },
    )
    expect(mockOnToggle).toHaveBeenCalled()
  })

  it('clicking apply with no pending tags removes tags param', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('tags=react'),
    )
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react']}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
    expect(mockOnToggle).toHaveBeenCalled()
  })

  it('active chip shows aria-current', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={['react']}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    expect(screen.getByText('react (10)')).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByText('typescript (7)')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('clears page param on apply', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=2'),
    )
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    fireEvent.click(screen.getByText('react (10)'))
    fireEvent.click(screen.getByText('Apply'))
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?tags=react', {
      scroll: false,
    })
  })

  it('renders empty panel when no tags', () => {
    renderWithTheme(
      <TagFilter
        tags={[]}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        applyLabel="Apply"
      />,
    )
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('renders tag search input when open', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
        tagSearchPlaceholder="Search tags..."
      />,
    )
    expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('tag-search-input')).toHaveAttribute(
      'placeholder',
      'Search tags...',
    )
  })

  it('does not render tag search input when closed', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={false}
        onToggle={mockOnToggle}
        tagSearchPlaceholder="Search tags..."
      />,
    )
    expect(screen.queryByTestId('tag-search-input')).not.toBeInTheDocument()
  })

  it('typing in search filters visible tags', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.change(screen.getByTestId('tag-search-input'), {
      target: { value: 'react' },
    })
    expect(screen.getByText('react (10)')).toBeInTheDocument()
    expect(screen.queryByText('typescript (7)')).not.toBeInTheDocument()
  })

  it('search is case insensitive', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.change(screen.getByTestId('tag-search-input'), {
      target: { value: 'REACT' },
    })
    expect(screen.getByText('react (10)')).toBeInTheDocument()
  })

  it('shows no chips when search matches nothing', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.change(screen.getByTestId('tag-search-input'), {
      target: { value: 'zzznomatch' },
    })
    expect(screen.queryByText('react (10)')).not.toBeInTheDocument()
    expect(screen.queryByText('typescript (7)')).not.toBeInTheDocument()
  })

  it('limits visible tags to 15', () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => ({
      tag: `tag-${i}`,
      count: i + 1,
    }))
    renderWithTheme(
      <TagFilter
        tags={manyTags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    const chips = screen.getAllByRole('button', { name: /tag-\d+ \(\d+\)/ })
    expect(chips).toHaveLength(15)
  })

  it('search resets when panel reopens', () => {
    const wrap = (isOpen: boolean) => (
      <ThemeProvider theme={mainTheme}>
        <TagFilter
          tags={tags}
          activeTags={[]}
          isOpen={isOpen}
          onToggle={mockOnToggle}
        />
      </ThemeProvider>
    )
    const { rerender } = renderWithTheme(
      <TagFilter
        tags={tags}
        activeTags={[]}
        isOpen={true}
        onToggle={mockOnToggle}
      />,
    )
    fireEvent.change(screen.getByTestId('tag-search-input'), {
      target: { value: 'react' },
    })
    expect(screen.queryByText('typescript (7)')).not.toBeInTheDocument()

    rerender(wrap(false))
    rerender(wrap(true))

    expect(screen.getByTestId('tag-search-input')).toHaveValue('')
    expect(screen.getByText('typescript (7)')).toBeInTheDocument()
  })
})
