'use client'

import { FieldGroup, FieldLabel } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import {
  FLOW_LEVEL_KEYS,
  FLOW_RAPPEL_KEYS,
  PHENOMENA_KEYS,
  STRINGS,
} from '@web/lib/cards'

import {
  StyledCheckbox,
  StyledCheckboxRow,
  StyledFlowSection,
} from './FlowField.styles'

// The admin form is English; option text uses the English labels. The card
// renders the localized label from STRINGS based on the card's own language.
const L = STRINGS.en

const LEVEL_OPTIONS: SelectOption[] = FLOW_LEVEL_KEYS.map((k) => ({
  value: k,
  label: L.flow_levels[k],
}))

const RAPPEL_OPTIONS: SelectOption[] = FLOW_RAPPEL_KEYS.map((k) => ({
  value: k,
  label: L.flow_rappels[k],
}))

export interface FlowValue {
  flowLevel?: string
  flowRappels?: string
  phenomena?: string[]
}

interface FlowFieldProps {
  value: FlowValue
  onChange: (patch: FlowValue) => void
  /** Prefix for input ids / test ids (e.g. "bc", "sb"). */
  idPrefix: string
}

/**
 * Structured "observed flow" inputs for canyoning cards: flow level
 * (single-select), whether it affects the rappels (single-select), and a set
 * of observed phenomena (multi-checkbox). All optional.
 */
export function FlowField({ value, onChange, idPrefix }: FlowFieldProps) {
  const { t } = useClientTranslation('admin')
  const phenomena = value.phenomena ?? []

  function togglePhenomenon(key: string) {
    const next = phenomena.includes(key)
      ? phenomena.filter((p) => p !== key)
      : [...phenomena, key]
    onChange({ phenomena: next })
  }

  return (
    <StyledFlowSection>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-flow-level`}>
          {t('cards.flow.observed')}
        </FieldLabel>
        <Select
          id={`${idPrefix}-flow-level`}
          value={value.flowLevel ?? ''}
          onChange={(flowLevel) => onChange({ flowLevel })}
          options={LEVEL_OPTIONS}
          isClearable
          data-testid={`${idPrefix}-flow-level`}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-flow-rappels`}>
          {t('cards.flow.affects')}
        </FieldLabel>
        <Select
          id={`${idPrefix}-flow-rappels`}
          value={value.flowRappels ?? ''}
          onChange={(flowRappels) => onChange({ flowRappels })}
          options={RAPPEL_OPTIONS}
          isClearable
          data-testid={`${idPrefix}-flow-rappels`}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel>{t('cards.flow.phenomena')}</FieldLabel>
        <StyledCheckboxRow>
          {PHENOMENA_KEYS.map((k) => (
            <StyledCheckbox key={k}>
              <input
                type="checkbox"
                checked={phenomena.includes(k)}
                onChange={() => togglePhenomenon(k)}
                data-testid={`${idPrefix}-phenomenon-${k}`}
              />
              {L.phenomena[k]}
            </StyledCheckbox>
          ))}
        </StyledCheckboxRow>
      </FieldGroup>
    </StyledFlowSection>
  )
}
