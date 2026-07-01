'use client'

import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import { STRINGS, WAYPOINT_CATEGORY_KEYS } from '@web/lib/cards'
import type {
  CanyonSeverity,
  CanyonSide,
  CanyonWaypoint,
  CanyonWaypointNote,
} from '@web/lib/cards'

import {
  StyledFieldRow,
  StyledNotes,
  StyledSection,
  StyledSectionTitle,
} from './CanyonWaypointFields.styles'

const CATEGORY_OPTIONS: SelectOption[] = WAYPOINT_CATEGORY_KEYS.map((k) => ({
  value: k,
  label: STRINGS.en.categories[k],
}))

interface CanyonWaypointFieldsProps {
  value: CanyonWaypoint
  onChange: (patch: Partial<CanyonWaypoint>) => void
}

/** Serialise notes to editable lines (leading space = nested). */
function notesToText(notes: CanyonWaypointNote[]): string {
  return notes.map((n) => `${n.sub ? ' ' : ''}- ${n.text}`).join('\n')
}

/** Parse editable note lines back to structured notes. */
function notesFromText(text: string): CanyonWaypointNote[] {
  return text
    .split('\n')
    .map((line) => {
      const sub = /^\s/.test(line)
      const t = line.replace(/^\s*[-•·]?\s*/, '').trim()
      return t ? { text: t, sub } : null
    })
    .filter((n): n is CanyonWaypointNote => n !== null)
}

/** Parse a numeric coordinate input; blank clears it. */
function toCoord(str: string): number | undefined {
  const s = str.trim()
  return s === '' ? undefined : Number(s)
}

/**
 * Structured editor for a single canyon waypoint: title, one or two
 * categories, coordinates and notes. Patches flow up to the generator, which
 * re-serialises the whole set back into its textarea source.
 */
export function CanyonWaypointFields({
  value,
  onChange,
}: CanyonWaypointFieldsProps) {
  const { t } = useClientTranslation('admin')

  const cat1 = value.categories[0] ?? 'info'
  const cat2 = value.categories[1] ?? ''

  const setCategories = (a: string, b: string) =>
    onChange({ categories: [...new Set([a, b].filter(Boolean))] })

  const secondaryOptions: SelectOption[] = [
    { value: '', label: t('cards.fields.categoryNone') },
    ...CATEGORY_OPTIONS,
  ]

  const sideOptions: SelectOption[] = [
    { value: '', label: t('cards.fields.auto') },
    { value: 'left', label: t('cards.fields.sideLeft') },
    { value: 'right', label: t('cards.fields.sideRight') },
  ]

  const severityOptions: SelectOption[] = [
    { value: '', label: t('cards.fields.auto') },
    { value: 'easy', label: t('cards.fields.sevEasy') },
    { value: 'caution', label: t('cards.fields.sevCaution') },
    { value: 'danger', label: t('cards.fields.sevDanger') },
  ]

  return (
    <>
      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.header')}</StyledSectionTitle>
        <FieldGroup>
          <FieldLabel htmlFor="cwf-title">{t('cards.fields.title')}</FieldLabel>
          <Input
            id="cwf-title"
            value={value.title}
            placeholder={t('cards.placeholders.waypointName')}
            onChange={(e) => onChange({ title: e.target.value })}
            data-testid="cwf-title"
          />
        </FieldGroup>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-cat1">
              {t('cards.fields.category')}
            </FieldLabel>
            <Select
              id="cwf-cat1"
              value={cat1}
              onChange={(c) => setCategories(c, cat2)}
              options={CATEGORY_OPTIONS}
              data-testid="cwf-cat1"
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-cat2">
              {t('cards.fields.categorySecondary')}
            </FieldLabel>
            <Select
              id="cwf-cat2"
              value={cat2}
              onChange={(c) => setCategories(cat1, c)}
              options={secondaryOptions}
              data-testid="cwf-cat2"
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.location')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-lat">
              {t('cards.fields.latitude')}
            </FieldLabel>
            <Input
              id="cwf-lat"
              type="number"
              value={value.lat ?? ''}
              placeholder="42.500000"
              onChange={(e) => onChange({ lat: toCoord(e.target.value) })}
              data-testid="cwf-lat"
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-lon">
              {t('cards.fields.longitude')}
            </FieldLabel>
            <Input
              id="cwf-lon"
              type="number"
              value={value.lon ?? ''}
              placeholder="-1.200000"
              onChange={(e) => onChange({ lon: toCoord(e.target.value) })}
              data-testid="cwf-lon"
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.overrides')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-side">{t('cards.fields.side')}</FieldLabel>
            <Select
              id="cwf-side"
              value={value.side ?? ''}
              onChange={(v) =>
                onChange({ side: v === '' ? undefined : (v as CanyonSide) })
              }
              options={sideOptions}
              data-testid="cwf-side"
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-sev">
              {t('cards.fields.severity')}
            </FieldLabel>
            <Select
              id="cwf-sev"
              value={value.severity ?? ''}
              onChange={(v) =>
                onChange({
                  severity: v === '' ? undefined : (v as CanyonSeverity),
                })
              }
              options={severityOptions}
              data-testid="cwf-sev"
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="cwf-meters">
              {t('cards.fields.meters')}
            </FieldLabel>
            <Input
              id="cwf-meters"
              value={value.meters ?? ''}
              placeholder="10 m"
              onChange={(e) =>
                onChange({ meters: e.target.value || undefined })
              }
              data-testid="cwf-meters"
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.notes')}</StyledSectionTitle>
        <FieldGroup>
          <FieldLabel htmlFor="cwf-notes">{t('cards.fields.notes')}</FieldLabel>
          <StyledNotes
            id="cwf-notes"
            value={notesToText(value.notes)}
            onChange={(e) => onChange({ notes: notesFromText(e.target.value) })}
            data-testid="cwf-notes"
          />
        </FieldGroup>
      </StyledSection>
    </>
  )
}
