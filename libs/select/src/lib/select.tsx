'use client'

import ReactSelect from 'react-select'
import CreatableReactSelect from 'react-select/creatable'

import { StyledSelectWrapper } from './select.styles'

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
  isSearchable?: boolean
  isCreatable?: boolean
  isClearable?: boolean
  'data-testid'?: string
}

type RsOption = {
  value: string
  label: string
  isDisabled: boolean | undefined
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '—',
  id,
  isSearchable = false,
  isCreatable = false,
  isClearable = false,
  'data-testid': testId,
}: SelectProps) {
  const rsOptions: RsOption[] = options.map((o) => ({
    value: o.value,
    label: o.label,
    isDisabled: o.disabled,
  }))

  const selected =
    rsOptions.find((o) => o.value === value) ??
    (value ? { value, label: value, isDisabled: undefined } : null)

  const commonProps = {
    inputId: id,
    unstyled: true,
    classNamePrefix: 'select',
    options: rsOptions,
    value: selected,
    onChange: (option: RsOption | null) => onChange(option?.value ?? ''),
    placeholder,
    isSearchable,
    isClearable,
  }

  return (
    <StyledSelectWrapper data-testid={testId}>
      {isCreatable ? (
        <CreatableReactSelect {...commonProps} />
      ) : (
        <ReactSelect {...commonProps} />
      )}
    </StyledSelectWrapper>
  )
}
