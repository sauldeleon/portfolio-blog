'use client'

import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import { STRINGS, WAYPOINT_CATEGORY_KEYS } from '@web/lib/cards'

import {
  StyledFieldRow,
  StyledSection,
  StyledSectionTitle,
} from './WaypointFields.styles'

/** Editable string-backed state for a single waypoint card. */
export interface WaypointState {
  name: string
  category: string
  lat: string
  lon: string
  ele: string
  emin: string
  emax: string
}

export const DEFAULT_WAYPOINT_STATE: WaypointState = {
  name: '',
  category: 'info',
  lat: '',
  lon: '',
  ele: '',
  emin: '',
  emax: '',
}

const CATEGORY_OPTIONS: SelectOption[] = WAYPOINT_CATEGORY_KEYS.map((k) => ({
  value: k,
  label: STRINGS.en.categories[k],
}))

interface WaypointFieldsProps {
  value: WaypointState
  onChange: (patch: Partial<WaypointState>) => void
}

/** Header, location and altimeter-scale inputs for a single waypoint card. */
export function WaypointFields({ value, onChange }: WaypointFieldsProps) {
  const { t } = useClientTranslation('admin')

  return (
    <>
      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.header')}</StyledSectionTitle>
        <FieldGroup>
          <FieldLabel htmlFor="wf-name">{t('cards.fields.name')}</FieldLabel>
          <Input
            id="wf-name"
            value={value.name}
            placeholder={t('cards.placeholders.waypointName')}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="wf-category">
            {t('cards.fields.category')}
          </FieldLabel>
          <Select
            id="wf-category"
            value={value.category}
            onChange={(category) => onChange({ category })}
            options={CATEGORY_OPTIONS}
            data-testid="wf-category"
          />
        </FieldGroup>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.location')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="wf-lat">
              {t('cards.fields.latitude')}
            </FieldLabel>
            <Input
              id="wf-lat"
              type="number"
              value={value.lat}
              placeholder="42.50000"
              onChange={(e) => onChange({ lat: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="wf-lon">
              {t('cards.fields.longitude')}
            </FieldLabel>
            <Input
              id="wf-lon"
              type="number"
              value={value.lon}
              placeholder="-1.20000"
              onChange={(e) => onChange({ lon: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="wf-ele">
              {t('cards.fields.elevation')}
            </FieldLabel>
            <Input
              id="wf-ele"
              type="number"
              value={value.ele}
              placeholder="1850"
              onChange={(e) => onChange({ ele: e.target.value })}
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>
          {t('cards.sections.altimeterScale')}
        </StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="wf-emin">
              {t('cards.fields.minElevation')}
            </FieldLabel>
            <Input
              id="wf-emin"
              type="number"
              value={value.emin}
              placeholder="1200"
              onChange={(e) => onChange({ emin: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="wf-emax">
              {t('cards.fields.maxElevation')}
            </FieldLabel>
            <Input
              id="wf-emax"
              type="number"
              value={value.emax}
              placeholder="2500"
              onChange={(e) => onChange({ emax: e.target.value })}
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>
    </>
  )
}
