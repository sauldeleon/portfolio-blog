'use client'

import { useEffect, useRef, useState } from 'react'

import {
  StyledChevron,
  StyledDropdown,
  StyledOption,
  StyledTrigger,
  StyledWrapper,
} from './select.styles'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  id?: string
  'data-testid'?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '—',
  id,
  'data-testid': testId,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  function handleSelect(optionValue: string) {
    onChange(optionValue)
    setOpen(false)
  }

  return (
    <StyledWrapper ref={wrapperRef} data-testid={testId}>
      <StyledTrigger
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        $open={open}
        $hasValue={!!selected}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <StyledChevron $open={open}>▾</StyledChevron>
      </StyledTrigger>

      {open && (
        <StyledDropdown role="listbox">
          {options.map((opt) => (
            <StyledOption
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              $selected={opt.value === value}
              $disabled={opt.disabled}
              onClick={() => {
                if (!opt.disabled) handleSelect(opt.value)
              }}
            >
              {opt.label}
            </StyledOption>
          ))}
        </StyledDropdown>
      )}
    </StyledWrapper>
  )
}
