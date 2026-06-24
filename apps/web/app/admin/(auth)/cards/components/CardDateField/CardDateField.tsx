'use client'

import { format, parse } from 'date-fns'

import { DateTimePicker } from '@sdlgr/date-picker'

/** Display format used both on the card and as the stored string value. */
export const CARD_DATE_FORMAT = 'dd MMM yyyy'

interface CardDateFieldProps {
  /** Stored date as a display string (e.g. "15 Jul 2025"). */
  value?: string
  onChange: (value: string) => void
  'data-testid'?: string
}

/** Parse a stored display string back into a Date for the picker. */
function parseStored(value?: string): Date | null {
  if (!value) return null
  const parsed = parse(value, CARD_DATE_FORMAT, new Date())
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Adapter bridging the shared DateTimePicker (Date | null) with the card
 * forms, which store the date as a plain display string.
 */
export function CardDateField({
  value,
  onChange,
  'data-testid': testId = 'card-date',
}: CardDateFieldProps) {
  return (
    <DateTimePicker
      value={parseStored(value)}
      onChange={(date) => onChange(date ? format(date, CARD_DATE_FORMAT) : '')}
      placeholder="Select date"
      data-testid={testId}
    />
  )
}
