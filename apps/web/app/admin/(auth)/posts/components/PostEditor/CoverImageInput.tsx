import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

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
      <div style={{ position: 'relative' }}>
        <Input
          id="meta-cover"
          type="text"
          value={displayValue}
          readOnly
          onClick={onPick}
          style={{
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box',
            paddingRight: value ? '1.5rem' : undefined,
          }}
          placeholder={placeholder}
          data-testid="cover-image-input"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            title={clearTitle}
            data-testid="clear-cover-image-button"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(251,251,251,0.5)',
              fontSize: '0.9rem',
              lineHeight: '1',
              padding: '0.2rem 0.3rem',
            }}
          >
            ×
          </button>
        )}
      </div>
    </FieldGroup>
  )
}
