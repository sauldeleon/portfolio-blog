'use client'

import { useMemo, useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import {
  STRINGS,
  WAYPOINT_CATEGORY_KEYS,
  waypointCard,
  waypointSlug,
} from '@web/lib/cards'
import type { Lang } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { CardPreview } from '../CardPreview'
import {
  StyledFieldRow,
  StyledForm,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
} from './WaypointForm.styles'

const LANGS: Lang[] = ['en', 'es']

const CATEGORY_OPTIONS: SelectOption[] = WAYPOINT_CATEGORY_KEYS.map((k) => ({
  value: k,
  label: STRINGS.en.categories[k],
}))

interface WaypointState {
  name: string
  category: string
  lat: string
  lon: string
  ele: string
  emin: string
  emax: string
}

const DEFAULT_STATE: WaypointState = {
  name: '',
  category: 'info',
  lat: '',
  lon: '',
  ele: '',
  emin: '',
  emax: '',
}

/** Build a custom single waypoint card from manual inputs (no GPX). */
export function WaypointForm() {
  const { t } = useClientTranslation('admin')
  const [lang, setLang] = useState<Lang>('en')
  const [data, setData] = useState<WaypointState>(DEFAULT_STATE)

  function set(patch: Partial<WaypointState>) {
    setData((d) => ({ ...d, ...patch }))
  }

  const svg = useMemo(
    () =>
      waypointCard({
        name: data.name || 'Waypoint',
        lat: Number(data.lat) || 0,
        lon: Number(data.lon) || 0,
        ele: Number(data.ele) || 0,
        emin: Number(data.emin) || 0,
        emax: Number(data.emax) || 0,
        category: data.category,
        lang,
      }),
    [data, lang],
  )

  const filename = `${lang}_${waypointSlug(data.name || 'waypoint')}`

  return (
    <StyledLayout data-testid="waypoint-form">
      <StyledPanelForm>
        <StyledForm>
          <StyledLangToggle>
            {LANGS.map((l) => (
              <Button
                key={l}
                type="button"
                variant="label"
                active={lang === l}
                onClick={() => setLang(l)}
                data-testid={`wp-lang-${l}`}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </StyledLangToggle>

          <StyledSection>
            <StyledSectionTitle>
              {t('cards.sections.header')}
            </StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="wf-name">
                {t('cards.fields.name')}
              </FieldLabel>
              <Input
                id="wf-name"
                value={data.name}
                placeholder={t('cards.placeholders.waypointName')}
                onChange={(e) => set({ name: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel htmlFor="wf-category">
                {t('cards.fields.category')}
              </FieldLabel>
              <Select
                id="wf-category"
                value={data.category}
                onChange={(category) => set({ category })}
                options={CATEGORY_OPTIONS}
                data-testid="wf-category"
              />
            </FieldGroup>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>
              {t('cards.sections.location')}
            </StyledSectionTitle>
            <StyledFieldRow>
              <FieldGroup>
                <FieldLabel htmlFor="wf-lat">
                  {t('cards.fields.latitude')}
                </FieldLabel>
                <Input
                  id="wf-lat"
                  type="number"
                  value={data.lat}
                  placeholder="42.50000"
                  onChange={(e) => set({ lat: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="wf-lon">
                  {t('cards.fields.longitude')}
                </FieldLabel>
                <Input
                  id="wf-lon"
                  type="number"
                  value={data.lon}
                  placeholder="-1.20000"
                  onChange={(e) => set({ lon: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="wf-ele">
                  {t('cards.fields.elevation')}
                </FieldLabel>
                <Input
                  id="wf-ele"
                  type="number"
                  value={data.ele}
                  placeholder="1850"
                  onChange={(e) => set({ ele: e.target.value })}
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
                  value={data.emin}
                  placeholder="1200"
                  onChange={(e) => set({ emin: e.target.value })}
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="wf-emax">
                  {t('cards.fields.maxElevation')}
                </FieldLabel>
                <Input
                  id="wf-emax"
                  type="number"
                  value={data.emax}
                  placeholder="2500"
                  onChange={(e) => set({ emax: e.target.value })}
                />
              </FieldGroup>
            </StyledFieldRow>
          </StyledSection>
        </StyledForm>
      </StyledPanelForm>

      <StyledPanelPreview>
        <CardPreview
          svg={svg}
          cardWidth={1080}
          cardHeight={320}
          filename={filename}
        />
      </StyledPanelPreview>
    </StyledLayout>
  )
}
