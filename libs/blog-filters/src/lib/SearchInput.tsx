'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { startTransition, useEffect, useRef, useState } from 'react'

import { useDebounce } from './useDebounce'

export interface SearchInputProps {
  placeholder?: string
  initialValue?: string
}

export function SearchInput({
  placeholder,
  initialValue = '',
}: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, 300)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set('q', debouncedValue)
    } else {
      params.delete('q')
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
    // intentionally omit router/pathname/searchParams — we only re-run when the debounced query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      data-testid="search-input"
    />
  )
}
