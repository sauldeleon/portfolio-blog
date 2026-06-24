'use client'

import { FieldGroup, FieldLabel } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'

const V_OPTIONS: SelectOption[] = Array.from({ length: 7 }, (_, i) => ({
  value: `v${i + 1}`,
  label: `v${i + 1}`,
}))

const A_OPTIONS: SelectOption[] = Array.from({ length: 7 }, (_, i) => ({
  value: `a${i + 1}`,
  label: `a${i + 1}`,
}))

const COMMITMENT_OPTIONS: SelectOption[] = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
].map((r) => ({ value: r, label: r }))

export interface CanyonGrade {
  v: string
  a: string
  commitment: string
}

/** Split a stored grade string (e.g. "v4 a3 III") into its three tokens. */
export function parseGrade(grade?: string): CanyonGrade {
  const result: CanyonGrade = { v: '', a: '', commitment: '' }
  for (const tok of (grade ?? '').split(' ').filter(Boolean)) {
    const c = tok[0]?.toLowerCase()
    if (c === 'v' && /\d/.test(tok)) result.v = tok
    else if (c === 'a' && /\d/.test(tok)) result.a = tok
    else if (/^[ivxlcdm]+$/i.test(tok)) result.commitment = tok.toUpperCase()
  }
  return result
}

/** Join the three tokens back into a single grade string, dropping blanks. */
export function composeGrade({ v, a, commitment }: CanyonGrade): string {
  return [v, a, commitment].filter(Boolean).join(' ')
}

interface CanyonGradeFieldProps {
  value?: string
  onChange: (grade: string) => void
  /** Prefix for input ids / test ids (e.g. "bc", "sb"). */
  idPrefix: string
}

/**
 * Three selects (vertical, aqua, commitment) that read/write the single
 * space-joined grade string used by the card renderer. Renders bare
 * FieldGroups so the parent form decides the row layout.
 */
export function CanyonGradeField({
  value,
  onChange,
  idPrefix,
}: CanyonGradeFieldProps) {
  const { t } = useClientTranslation('admin')
  const grade = parseGrade(value)

  function update(patch: Partial<CanyonGrade>) {
    onChange(composeGrade({ ...grade, ...patch }))
  }

  return (
    <>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-grade-v`}>
          {t('cards.fields.grade')}
        </FieldLabel>
        <Select
          id={`${idPrefix}-grade-v`}
          value={grade.v}
          onChange={(v) => update({ v })}
          options={V_OPTIONS}
          isClearable
          data-testid={`${idPrefix}-grade-v`}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-grade-a`}>
          {t('cards.fields.aqua')}
        </FieldLabel>
        <Select
          id={`${idPrefix}-grade-a`}
          value={grade.a}
          onChange={(a) => update({ a })}
          options={A_OPTIONS}
          isClearable
          data-testid={`${idPrefix}-grade-a`}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldLabel htmlFor={`${idPrefix}-grade-commitment`}>
          {t('cards.fields.commitment')}
        </FieldLabel>
        <Select
          id={`${idPrefix}-grade-commitment`}
          value={grade.commitment}
          onChange={(commitment) => update({ commitment })}
          options={COMMITMENT_OPTIONS}
          isClearable
          data-testid={`${idPrefix}-grade-commitment`}
        />
      </FieldGroup>
    </>
  )
}
