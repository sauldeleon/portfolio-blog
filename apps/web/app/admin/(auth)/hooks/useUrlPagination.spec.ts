import { renderHook } from '@testing-library/react'

import { ADMIN_PAGE_SIZE, useUrlPagination } from './useUrlPagination'

const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/admin/things',
  useSearchParams: () => mockSearchParams,
}))

const items = Array.from({ length: 25 }, (_, i) => i)

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParams = new URLSearchParams()
})

describe('useUrlPagination', () => {
  it('starts on the first page', () => {
    const { result } = renderHook(() => useUrlPagination(items, 10))
    expect(result.current.page).toBe(1)
    expect(result.current.pageItems).toEqual(items.slice(0, 10))
  })

  it('reads the page from the URL', () => {
    mockSearchParams = new URLSearchParams('page=2')
    const { result } = renderHook(() => useUrlPagination(items, 10))
    expect(result.current.page).toBe(2)
    expect(result.current.pageItems).toEqual(items.slice(10, 20))
  })

  it('clamps a page past the end to the last page', () => {
    mockSearchParams = new URLSearchParams('page=9')
    const { result } = renderHook(() => useUrlPagination(items, 10))
    expect(result.current.page).toBe(3)
    expect(result.current.pageItems).toEqual([20, 21, 22, 23, 24])
  })

  it('falls back to the first page for invalid values', () => {
    mockSearchParams = new URLSearchParams('page=-3')
    expect(
      renderHook(() => useUrlPagination(items, 10)).result.current.page,
    ).toBe(1)
    mockSearchParams = new URLSearchParams('page=nope')
    expect(
      renderHook(() => useUrlPagination(items, 10)).result.current.page,
    ).toBe(1)
  })

  it('handles an empty list', () => {
    const { result } = renderHook(() => useUrlPagination([], 10))
    expect(result.current.page).toBe(1)
    expect(result.current.pageItems).toEqual([])
  })

  it('resetPage removes only the page param', () => {
    mockSearchParams = new URLSearchParams('page=2&filter=draft')
    const { result } = renderHook(() => useUrlPagination(items, 10))
    result.current.resetPage()
    expect(mockReplace).toHaveBeenCalledWith('/admin/things?filter=draft')
  })

  it('resetPage goes to the bare path when page was the only param', () => {
    mockSearchParams = new URLSearchParams('page=2')
    const { result } = renderHook(() => useUrlPagination(items, 10))
    result.current.resetPage()
    expect(mockReplace).toHaveBeenCalledWith('/admin/things')
  })

  it('resetPage does nothing when already on the first page', () => {
    const { result } = renderHook(() => useUrlPagination(items, 10))
    result.current.resetPage()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('defaults to the admin page size', () => {
    const many = Array.from({ length: ADMIN_PAGE_SIZE + 1 }, (_, i) => i)
    const { result } = renderHook(() => useUrlPagination(many))
    expect(result.current.pageItems).toHaveLength(ADMIN_PAGE_SIZE)
  })
})
