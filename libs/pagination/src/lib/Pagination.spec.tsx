import { fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Pagination } from './Pagination'

const mockPush = jest.fn()

const defaultProps = {
  total: 25,
  page: 1,
  limit: 10,
  previousLabel: 'Previous',
  nextLabel: 'Next',
}

describe('Pagination', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('returns null when total fits on one page', () => {
    renderWithTheme(<Pagination {...defaultProps} total={5} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('returns null when total is zero', () => {
    renderWithTheme(<Pagination {...defaultProps} total={0} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders page buttons for each page', () => {
    renderWithTheme(<Pagination {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders previous and next buttons', () => {
    renderWithTheme(<Pagination {...defaultProps} />)
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('previous button is disabled on first page', () => {
    renderWithTheme(<Pagination {...defaultProps} page={1} />)
    expect(screen.getByText('Previous')).toBeDisabled()
  })

  it('next button is disabled on last page', () => {
    renderWithTheme(<Pagination {...defaultProps} page={3} />)
    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('marks current page with aria-current', () => {
    renderWithTheme(<Pagination {...defaultProps} page={2} />)
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page')
  })

  it('clicking a page button pushes correct URL', () => {
    renderWithTheme(<Pagination {...defaultProps} page={1} />)
    fireEvent.click(screen.getByText('2'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?page=2')
  })

  it('clicking next pushes next page URL', () => {
    renderWithTheme(<Pagination {...defaultProps} page={1} />)
    fireEvent.click(screen.getByText('Next'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?page=2')
  })

  it('clicking previous pushes previous page URL', () => {
    renderWithTheme(<Pagination {...defaultProps} page={2} />)
    fireEvent.click(screen.getByText('Previous'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?page=1')
  })

  it('preserves existing search params when navigating', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('category=react'),
    )
    renderWithTheme(<Pagination {...defaultProps} page={1} />)
    fireEvent.click(screen.getByText('2'))
    expect(mockPush).toHaveBeenCalledWith('/en/blog?category=react&page=2')
  })
})
