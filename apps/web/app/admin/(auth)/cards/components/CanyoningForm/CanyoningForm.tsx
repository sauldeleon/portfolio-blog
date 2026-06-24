'use client'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { CanyoningCardData, Lang } from '@web/lib/cards'

import { CanyonGradeField } from '../CanyonGradeField'
import { CardDateField } from '../CardDateField'
import { FlowField } from '../FlowField'
import {
  StyledFieldRow,
  StyledForm,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
  StyledTimesRow,
} from './CanyoningForm.styles'

interface CanyoningFormProps {
  value: CanyoningCardData
  onChange: (next: CanyoningCardData) => void
}

const LANGS: Lang[] = ['en', 'es']

export function CanyoningForm({ value, onChange }: CanyoningFormProps) {
  const { t } = useClientTranslation('admin')
  function set(patch: Partial<CanyoningCardData>) {
    onChange({ ...value, ...patch })
  }

  return (
    <StyledForm data-testid="canyoning-form">
      <StyledLangToggle>
        {LANGS.map((l) => (
          <Button
            key={l}
            type="button"
            variant="label"
            active={value.lang === l}
            onClick={() => set({ lang: l })}
            data-testid={`lang-${l}`}
          >
            {l.toUpperCase()}
          </Button>
        ))}
      </StyledLangToggle>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.header')}</StyledSectionTitle>
        <FieldGroup>
          <FieldLabel htmlFor="bc-title">{t('cards.fields.title')}</FieldLabel>
          <Input
            id="bc-title"
            value={value.title ?? ''}
            placeholder={t('cards.placeholders.canyonName')}
            onChange={(e) => set({ title: e.target.value })}
          />
        </FieldGroup>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel>{t('cards.fields.date')}</FieldLabel>
            <CardDateField
              value={value.date}
              onChange={(date) => set({ date })}
              data-testid="bc-date"
            />
          </FieldGroup>
          <CanyonGradeField
            value={value.grade}
            onChange={(grade) => set({ grade })}
            idPrefix="bc"
          />
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.metrics')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="bc-desnivel">
              {t('cards.fields.descent')}
            </FieldLabel>
            <Input
              id="bc-desnivel"
              value={value.desnivel ?? ''}
              placeholder="250 m"
              onChange={(e) => set({ desnivel: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-maxrappel">
              {t('cards.fields.maxRappel')}
            </FieldLabel>
            <Input
              id="bc-maxrappel"
              value={value.maxRappel ?? ''}
              placeholder="45 m"
              onChange={(e) => set({ maxRappel: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-rappels">
              {t('cards.fields.rappels')}
            </FieldLabel>
            <Input
              id="bc-rappels"
              value={value.rappels ?? ''}
              placeholder="12"
              onChange={(e) => set({ rappels: e.target.value })}
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.times')}</StyledSectionTitle>
        <StyledTimesRow>
          <FieldGroup>
            <FieldLabel htmlFor="bc-approach">
              {t('cards.fields.approach')}
            </FieldLabel>
            <Input
              id="bc-approach"
              value={value.approach ?? ''}
              placeholder="0:30"
              onChange={(e) => set({ approach: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-incanyon">
              {t('cards.fields.inCanyon')}
            </FieldLabel>
            <Input
              id="bc-incanyon"
              value={value.inCanyon ?? ''}
              placeholder="3:00"
              onChange={(e) => set({ inCanyon: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-return">
              {t('cards.fields.returnTime')}
            </FieldLabel>
            <Input
              id="bc-return"
              value={value.returnTime ?? ''}
              placeholder="0:20"
              onChange={(e) => set({ returnTime: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-total">
              {t('cards.fields.total')}
            </FieldLabel>
            <Input
              id="bc-total"
              value={value.total ?? ''}
              placeholder="4:00"
              onChange={(e) => set({ total: e.target.value })}
            />
          </FieldGroup>
        </StyledTimesRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.techSheet')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="bc-rope">{t('cards.fields.rope')}</FieldLabel>
            <Input
              id="bc-rope"
              value={value.rope ?? ''}
              placeholder="2x 30 m"
              onChange={(e) => set({ rope: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-cars">{t('cards.fields.cars')}</FieldLabel>
            <Input
              id="bc-cars"
              value={value.cars ?? ''}
              placeholder="2"
              onChange={(e) => set({ cars: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="bc-season">
              {t('cards.fields.season')}
            </FieldLabel>
            <Input
              id="bc-season"
              value={value.season ?? ''}
              placeholder="jun-sep"
              onChange={(e) => set({ season: e.target.value })}
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.flow')}</StyledSectionTitle>
        <FlowField
          value={value}
          onChange={(patch) => set(patch)}
          idPrefix="bc"
        />
      </StyledSection>
    </StyledForm>
  )
}
