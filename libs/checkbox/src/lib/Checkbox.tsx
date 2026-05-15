import type { InputHTMLAttributes } from 'react'

import {
  StyledBox,
  StyledLabel,
  StyledNativeInput,
  StyledWrapper,
} from './Checkbox.styles'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> {
  id: string
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled,
  ...rest
}: CheckboxProps) {
  return (
    <StyledWrapper htmlFor={id}>
      <StyledNativeInput
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => {
          if (!disabled) onChange(e.target.checked)
        }}
        disabled={disabled}
        {...rest}
      />
      <StyledBox $checked={checked} aria-hidden="true" />
      {label && <StyledLabel>{label}</StyledLabel>}
    </StyledWrapper>
  )
}
