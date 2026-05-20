'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { startTransition } from 'react'

import {
  StyledChip,
  StyledChipList,
  StyledDropdownButton,
  StyledDropdownPanel,
  StyledDropdownWrapper,
} from './BlogFilters.styles'

export interface DateGroup {
  year: number
  count: number
  months: { month: number; count: number }[]
}

export interface DateFilterProps {
  dates: DateGroup[]
  activeYear: number | null
  activeMonth: number | null
  label?: string
  /** 12-item array of localised month abbreviations, 0-indexed (Jan = index 0) */
  monthNames: string[]
  isOpen: boolean
  onToggle: () => void
}

export function DateFilter({
  dates,
  activeYear,
  activeMonth,
  label,
  monthNames,
  isOpen,
  onToggle,
}: DateFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (dates.length === 0) return null

  const handleYear = (year: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeYear === year) {
      params.delete('year')
      params.delete('month')
    } else {
      params.set('year', String(year))
      params.delete('month')
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const handleMonth = (month: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeMonth === month) {
      params.delete('month')
    } else {
      params.set('month', String(month))
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const activeDateGroup = dates.find((d) => d.year === activeYear)

  const buttonLabel = activeYear
    ? activeMonth
      ? `${activeYear} › ${monthNames[activeMonth - 1]}`
      : String(activeYear)
    : label

  return (
    <StyledDropdownWrapper>
      <StyledDropdownButton
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid="filter-trigger"
      >
        {buttonLabel} ▾
      </StyledDropdownButton>
      {isOpen && (
        <StyledDropdownPanel>
          <StyledChipList>
            {dates.map(({ year, count }) => (
              <li key={year}>
                <StyledChip
                  $small
                  onClick={() => handleYear(year)}
                  active={year === activeYear}
                  aria-current={year === activeYear ? true : undefined}
                >
                  {year} ({count})
                </StyledChip>
              </li>
            ))}
          </StyledChipList>
          {activeDateGroup && (
            <StyledChipList>
              {activeDateGroup.months.map(({ month, count }) => (
                <li key={month}>
                  <StyledChip
                    $small
                    onClick={() => handleMonth(month)}
                    active={month === activeMonth}
                    aria-current={month === activeMonth ? true : undefined}
                  >
                    {monthNames[month - 1]} ({count})
                  </StyledChip>
                </li>
              ))}
            </StyledChipList>
          )}
        </StyledDropdownPanel>
      )}
    </StyledDropdownWrapper>
  )
}
