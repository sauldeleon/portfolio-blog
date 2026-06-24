'use client'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { Lang, SummaryCanyoningData } from '@web/lib/cards'

import { CanyonGradeField } from '../CanyonGradeField'
import { CardDateField } from '../CardDateField'
import { FlowField } from '../FlowField'
import { GpxUrlField } from '../GpxUrlField'
import {
  StyledFieldRow,
  StyledForm,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
  StyledTimesRow,
} from './SummaryCanyoningForm.styles'

interface SummaryCanyoningFormProps {
  value: SummaryCanyoningData
  onChange: (next: SummaryCanyoningData) => void
}

const LANGS: Lang[] = ['en', 'es']

export function SummaryCanyoningForm({
  value,
  onChange,
}: SummaryCanyoningFormProps) {
  const { t } = useClientTranslation('admin')
  function set(patch: Partial<SummaryCanyoningData>) {
    onChange({ ...value, ...patch })
  }

  return (
    <StyledForm data-testid="summary-canyoning-form">
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
          <FieldLabel htmlFor="sb-title">{t('cards.fields.title')}</FieldLabel>
          <Input
            id="sb-title"
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
              data-testid="sb-date"
            />
          </FieldGroup>
          <CanyonGradeField
            value={value.grade}
            onChange={(grade) => set({ grade })}
            idPrefix="sb"
          />
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.metrics')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="sb-desnivel">
              {t('cards.fields.descent')}
            </FieldLabel>
            <Input
              id="sb-desnivel"
              value={value.desnivel ?? ''}
              placeholder="250 m"
              onChange={(e) => set({ desnivel: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-maxrappel">
              {t('cards.fields.maxRappel')}
            </FieldLabel>
            <Input
              id="sb-maxrappel"
              value={value.maxRappel ?? ''}
              placeholder="45 m"
              onChange={(e) => set({ maxRappel: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-rappels">
              {t('cards.fields.rappels')}
            </FieldLabel>
            <Input
              id="sb-rappels"
              value={value.rappels ?? ''}
              placeholder="12"
              onChange={(e) => set({ rappels: e.target.value })}
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.gpx')}</StyledSectionTitle>
        <GpxUrlField
          value={value.gpxUrl}
          onChange={(gpxUrl) => set({ gpxUrl })}
          onParsed={(m) =>
            set({
              date: m.date || value.date,
              desnivel: m.descent || value.desnivel,
              ini: m.startTime || value.ini,
              fin: m.endTime || value.fin,
              mov: m.movingTime || value.mov,
              det: m.stoppedTime || value.det,
              tot: m.totalTime || value.tot,
              elevation: m.elevation,
            })
          }
          idPrefix="sb"
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.times')}</StyledSectionTitle>
        <StyledTimesRow>
          <FieldGroup>
            <FieldLabel htmlFor="sb-mov">{t('cards.fields.moving')}</FieldLabel>
            <Input
              id="sb-mov"
              value={value.mov ?? ''}
              placeholder="3:00"
              onChange={(e) => set({ mov: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-det">
              {t('cards.fields.stopped')}
            </FieldLabel>
            <Input
              id="sb-det"
              value={value.det ?? ''}
              placeholder="0:30"
              onChange={(e) => set({ det: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-tot">{t('cards.fields.total')}</FieldLabel>
            <Input
              id="sb-tot"
              value={value.tot ?? ''}
              placeholder="4:00"
              onChange={(e) => set({ tot: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-ini">{t('cards.fields.start')}</FieldLabel>
            <Input
              id="sb-ini"
              type="time"
              value={value.ini ?? ''}
              onChange={(e) => set({ ini: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-fin">{t('cards.fields.end')}</FieldLabel>
            <Input
              id="sb-fin"
              type="time"
              value={value.fin ?? ''}
              onChange={(e) => set({ fin: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-ret">{t('cards.fields.return')}</FieldLabel>
            <Input
              id="sb-ret"
              value={value.ret ?? ''}
              placeholder={t('cards.placeholders.return')}
              onChange={(e) => set({ ret: e.target.value })}
            />
          </FieldGroup>
        </StyledTimesRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.techSheet')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="sb-rope">{t('cards.fields.rope')}</FieldLabel>
            <Input
              id="sb-rope"
              value={value.rope ?? ''}
              placeholder="2x 30 m"
              onChange={(e) => set({ rope: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-cars">{t('cards.fields.cars')}</FieldLabel>
            <Input
              id="sb-cars"
              value={value.cars ?? ''}
              placeholder="2"
              onChange={(e) => set({ cars: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="sb-season">
              {t('cards.fields.season')}
            </FieldLabel>
            <Input
              id="sb-season"
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
          idPrefix="sb"
        />
      </StyledSection>
    </StyledForm>
  )
}
