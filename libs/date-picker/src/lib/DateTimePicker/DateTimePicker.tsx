'use client'

import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'

import {
  StyledClearButton,
  StyledPopover,
  StyledTrigger,
  StyledWrapper,
} from './DateTimePicker.styles'

export interface DateTimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  'data-testid'?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Not scheduled',
  'data-testid': testId = 'datetime-picker',
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      const node = wrapperRef.current as HTMLDivElement
      if (!node.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function handleDaySelect(day: Date | undefined) {
    if (!day) {
      onChange(null)
      return
    }
    const next = new Date(day)
    next.setHours(0, 0, 0, 0)
    onChange(next)
    setOpen(false)
  }

  function handleClear() {
    onChange(null)
    setOpen(false)
  }

  return (
    <StyledWrapper ref={wrapperRef} data-testid={testId}>
      <StyledTrigger
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid={`${testId}-trigger`}
        $hasValue={!!value}
      >
        {value ? format(value, 'dd MMM yyyy') : placeholder}
      </StyledTrigger>
      {open && (
        <StyledPopover data-testid={`${testId}-popover`}>
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={handleDaySelect}
          />
          <StyledClearButton
            type="button"
            onClick={handleClear}
            data-testid={`${testId}-clear`}
          >
            Clear
          </StyledClearButton>
        </StyledPopover>
      )}
    </StyledWrapper>
  )
}
