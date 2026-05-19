import { FieldGroup, FieldLabel } from '@sdlgr/input'

import {
  StyledClearButton,
  StyledInputWrapper,
  StyledPickerInput,
} from './CoverImageInput.styles'

interface CoverImageInputProps {
  label: string
  placeholder: string
  clearTitle: string
  value: string
  onPick: () => void
  onClear: () => void
}

export function CoverImageInput({
  label,
  placeholder,
  clearTitle,
  value,
  onPick,
  onClear,
}: CoverImageInputProps) {
  const displayValue = value ? value.split('/').pop()! : ''

  return (
    <FieldGroup>
      <FieldLabel htmlFor="meta-cover">{label}</FieldLabel>
      <StyledInputWrapper>
        <StyledPickerInput
          id="meta-cover"
          type="text"
          value={displayValue}
          readOnly
          onClick={onPick}
          $hasValue={!!value}
          placeholder={placeholder}
          data-testid="cover-image-input"
        />
        {value && (
          <StyledClearButton
            type="button"
            onClick={onClear}
            title={clearTitle}
            data-testid="clear-cover-image-button"
          >
            ×
          </StyledClearButton>
        )}
      </StyledInputWrapper>
    </FieldGroup>
  )
}
