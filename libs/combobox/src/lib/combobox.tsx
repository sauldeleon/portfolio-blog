'use client'

import CreatableSelect from 'react-select/creatable'

import { StyledComboboxWrapper } from './combobox.styles'

export interface ComboboxProps {
  value: string[]
  onChange: (values: string[]) => void
  options: string[]
  placeholder?: string
  isValidNewOption?: (inputValue: string) => boolean
  'data-testid'?: string
}

type ComboboxOption = { value: string; label: string }

export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  isValidNewOption,
  'data-testid': testId,
}: ComboboxProps) {
  const selectOptions: ComboboxOption[] = options.map((opt) => ({
    value: opt,
    label: opt,
  }))

  const selectValue: ComboboxOption[] = value.map((v) => ({
    value: v,
    label: v,
  }))

  return (
    <StyledComboboxWrapper data-testid={testId}>
      <CreatableSelect
        isMulti
        unstyled
        classNamePrefix="combobox"
        options={selectOptions}
        value={selectValue}
        onChange={(selected) => onChange(selected.map((opt) => opt.value))}
        placeholder={placeholder}
        isClearable={false}
        formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
        {...(isValidNewOption ? { isValidNewOption } : {})}
      />
    </StyledComboboxWrapper>
  )
}
