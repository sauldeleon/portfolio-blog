'use client'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'
import { Select } from '@sdlgr/select'
import type { SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import type { Lang, SummaryFerrataData } from '@web/lib/cards'

import { CardDateField } from '../CardDateField'
import { GpxUrlField } from '../GpxUrlField'
import {
  StyledFieldRow,
  StyledForm,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
  StyledTimesRow,
} from './FerrataForm.styles'

interface FerrataFormProps {
  value: SummaryFerrataData
  onChange: (next: SummaryFerrataData) => void
}

const LANGS: Lang[] = ['en', 'es']

const FERRATA_GRADE_OPTIONS: SelectOption[] = Array.from(
  { length: 7 },
  (_, i) => ({
    value: `K${i + 1}`,
    label: `K${i + 1}`,
  }),
)

export function FerrataForm({ value, onChange }: FerrataFormProps) {
  const { t } = useClientTranslation('admin')
  function set(patch: Partial<SummaryFerrataData>) {
    onChange({ ...value, ...patch })
  }

  return (
    <StyledForm data-testid="ferrata-form">
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
          <FieldLabel htmlFor="ft-title">{t('cards.fields.title')}</FieldLabel>
          <Input
            id="ft-title"
            value={value.title ?? ''}
            placeholder={t('cards.placeholders.ferrataName')}
            onChange={(e) => set({ title: e.target.value })}
          />
        </FieldGroup>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel>{t('cards.fields.date')}</FieldLabel>
            <CardDateField
              value={value.date}
              onChange={(date) => set({ date })}
              data-testid="ft-date"
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-grade">
              {t('cards.fields.grade')}
            </FieldLabel>
            <Select
              id="ft-grade"
              value={value.grade ?? ''}
              onChange={(grade) => set({ grade })}
              options={FERRATA_GRADE_OPTIONS}
              isClearable
              data-testid="ft-grade"
            />
          </FieldGroup>
        </StyledFieldRow>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.ferrata')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="ft-cable">
              {t('cards.fields.cable')}
            </FieldLabel>
            <Input
              id="ft-cable"
              value={value.cable ?? ''}
              placeholder="800 m"
              onChange={(e) => set({ cable: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-vertical">
              {t('cards.fields.vertical')}
            </FieldLabel>
            <Input
              id="ft-vertical"
              value={value.vertical ?? ''}
              placeholder="350 m"
              onChange={(e) => set({ vertical: e.target.value })}
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
              ini: m.startTime || value.ini,
              fin: m.endTime || value.fin,
              mov: m.movingTime || value.mov,
              det: m.stoppedTime || value.det,
              tot: m.totalTime || value.tot,
              elevation: m.elevation,
            })
          }
          idPrefix="ft"
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.times')}</StyledSectionTitle>
        <StyledTimesRow>
          <FieldGroup>
            <FieldLabel htmlFor="ft-mov">{t('cards.fields.moving')}</FieldLabel>
            <Input
              id="ft-mov"
              value={value.mov ?? ''}
              placeholder="2:30"
              onChange={(e) => set({ mov: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-det">
              {t('cards.fields.stopped')}
            </FieldLabel>
            <Input
              id="ft-det"
              value={value.det ?? ''}
              placeholder="0:15"
              onChange={(e) => set({ det: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-tot">{t('cards.fields.total')}</FieldLabel>
            <Input
              id="ft-tot"
              value={value.tot ?? ''}
              placeholder="2:45"
              onChange={(e) => set({ tot: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-ini">{t('cards.fields.start')}</FieldLabel>
            <Input
              id="ft-ini"
              type="time"
              value={value.ini ?? ''}
              onChange={(e) => set({ ini: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-fin">{t('cards.fields.end')}</FieldLabel>
            <Input
              id="ft-fin"
              type="time"
              value={value.fin ?? ''}
              onChange={(e) => set({ fin: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="ft-ret">{t('cards.fields.return')}</FieldLabel>
            <Input
              id="ft-ret"
              value={value.ret ?? ''}
              placeholder={t('cards.placeholders.return')}
              onChange={(e) => set({ ret: e.target.value })}
            />
          </FieldGroup>
        </StyledTimesRow>
      </StyledSection>
    </StyledForm>
  )
}
