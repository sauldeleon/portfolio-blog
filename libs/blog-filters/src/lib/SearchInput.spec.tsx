import { act, fireEvent, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { renderWithTheme } from '@sdlgr/test-utils'

import { SearchInput } from './SearchInput'

const mockReplace = jest.fn()

describe('SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockReplace })
    ;(usePathname as jest.Mock).mockReturnValue('/en/blog')
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders an input with the correct placeholder', () => {
    renderWithTheme(<SearchInput placeholder="Search posts..." />)
    expect(screen.getByTestId('search-input')).toHaveAttribute(
      'placeholder',
      'Search posts...',
    )
  })

  it('renders with initial value', () => {
    renderWithTheme(<SearchInput initialValue="react" />)
    expect(screen.getByTestId('search-input')).toHaveValue('react')
  })

  it('does not call router.replace on mount', () => {
    renderWithTheme(<SearchInput />)
    act(() => {
      jest.runAllTimers()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('updates input value on change', () => {
    renderWithTheme(<SearchInput />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'next' },
    })
    expect(screen.getByTestId('search-input')).toHaveValue('next')
  })

  it('calls router.replace with q param after debounce', () => {
    renderWithTheme(<SearchInput />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'react' },
    })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?q=react', {
      scroll: false,
    })
  })

  it('clears q param when input is cleared', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('q=react'),
    )
    renderWithTheme(<SearchInput initialValue="react" />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: '' },
    })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?', { scroll: false })
  })

  it('clears page param when search changes', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('page=3'),
    )
    renderWithTheme(<SearchInput />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'test' },
    })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(mockReplace).toHaveBeenCalledWith('/en/blog?q=test', {
      scroll: false,
    })
  })

  it('does not call router.replace before debounce delay', () => {
    renderWithTheme(<SearchInput />)
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'react' },
    })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
