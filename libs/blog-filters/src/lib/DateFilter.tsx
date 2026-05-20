'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  StyledChip,
  StyledChipList,
  StyledFilterLabel,
  StyledFilterNav,
} from './BlogFilters.styles'

export interface DateGroup {
  year: number
  months: number[]
}

export interface DateFilterProps {
  dates: DateGroup[]
  activeYear: number | null
  activeMonth: number | null
  label?: string
  /** 12-item array of localised month abbreviations, 0-indexed (Jan = index 0) */
  monthNames: string[]
}

export function DateFilter({
  dates,
  activeYear,
  activeMonth,
  label,
  monthNames,
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
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleMonth = (month: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeMonth === month) {
      params.delete('month')
    } else {
      params.set('month', String(month))
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeDateGroup = dates.find((d) => d.year === activeYear)

  return (
    <StyledFilterNav aria-label={label}>
      {label ? <StyledFilterLabel>{label}</StyledFilterLabel> : null}
      <StyledChipList>
        {dates.map(({ year }) => (
          <li key={year}>
            <StyledChip
              $small
              onClick={() => handleYear(year)}
              active={year === activeYear}
              aria-current={year === activeYear ? true : undefined}
            >
              {year}
            </StyledChip>
          </li>
        ))}
      </StyledChipList>
      {activeDateGroup && (
        <StyledChipList>
          {activeDateGroup.months.map((month) => (
            <li key={month}>
              <StyledChip
                $small
                onClick={() => handleMonth(month)}
                active={month === activeMonth}
                aria-current={month === activeMonth ? true : undefined}
              >
                {monthNames[month - 1]}
              </StyledChip>
            </li>
          ))}
        </StyledChipList>
      )}
    </StyledFilterNav>
  )
}
