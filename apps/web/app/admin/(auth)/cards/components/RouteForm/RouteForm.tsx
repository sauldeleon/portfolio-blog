'use client'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { Lang, SummaryRouteData } from '@web/lib/cards'

import { CardDateField } from '../CardDateField'
import { GpxUrlField } from '../GpxUrlField'
import {
  StyledFieldRow,
  StyledForm,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
  StyledTimesRow,
} from './RouteForm.styles'

interface RouteFormProps {
  value: SummaryRouteData
  onChange: (next: SummaryRouteData) => void
}

const LANGS: Lang[] = ['en', 'es']

export function RouteForm({ value, onChange }: RouteFormProps) {
  const { t } = useClientTranslation('admin')
  function set(patch: Partial<SummaryRouteData>) {
    onChange({ ...value, ...patch })
  }

  return (
    <StyledForm data-testid="route-form">
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
          <FieldLabel htmlFor="rt-title">{t('cards.fields.title')}</FieldLabel>
          <Input
            id="rt-title"
            value={value.title ?? ''}
            placeholder={t('cards.placeholders.routeName')}
            onChange={(e) => set({ title: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>{t('cards.fields.date')}</FieldLabel>
          <CardDateField
            value={value.date}
            onChange={(date) => set({ date })}
            data-testid="rt-date"
          />
        </FieldGroup>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.metrics')}</StyledSectionTitle>
        <StyledFieldRow>
          <FieldGroup>
            <FieldLabel htmlFor="rt-dist">
              {t('cards.fields.distance')}
            </FieldLabel>
            <Input
              id="rt-dist"
              value={value.dist ?? ''}
              placeholder="12.4 km"
              onChange={(e) => set({ dist: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-dplus">
              {t('cards.fields.ascent')}
            </FieldLabel>
            <Input
              id="rt-dplus"
              value={value.dplus ?? ''}
              placeholder="1200 m"
              onChange={(e) => set({ dplus: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-dminus">
              {t('cards.fields.descentAccum')}
            </FieldLabel>
            <Input
              id="rt-dminus"
              value={value.dminus ?? ''}
              placeholder="1200 m"
              onChange={(e) => set({ dminus: e.target.value })}
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
              dist: m.distanceKm,
              dplus: m.ascent,
              dminus: m.descent,
              ini: m.startTime || value.ini,
              fin: m.endTime || value.fin,
              mov: m.movingTime || value.mov,
              det: m.stoppedTime || value.det,
              tot: m.totalTime || value.tot,
              elevation: m.elevation,
            })
          }
          idPrefix="rt"
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.times')}</StyledSectionTitle>
        <StyledTimesRow>
          <FieldGroup>
            <FieldLabel htmlFor="rt-mov">{t('cards.fields.moving')}</FieldLabel>
            <Input
              id="rt-mov"
              value={value.mov ?? ''}
              placeholder="4:30"
              onChange={(e) => set({ mov: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-det">
              {t('cards.fields.stopped')}
            </FieldLabel>
            <Input
              id="rt-det"
              value={value.det ?? ''}
              placeholder="0:45"
              onChange={(e) => set({ det: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-tot">{t('cards.fields.total')}</FieldLabel>
            <Input
              id="rt-tot"
              value={value.tot ?? ''}
              placeholder="5:15"
              onChange={(e) => set({ tot: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-ini">{t('cards.fields.start')}</FieldLabel>
            <Input
              id="rt-ini"
              type="time"
              value={value.ini ?? ''}
              onChange={(e) => set({ ini: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="rt-fin">{t('cards.fields.end')}</FieldLabel>
            <Input
              id="rt-fin"
              type="time"
              value={value.fin ?? ''}
              onChange={(e) => set({ fin: e.target.value })}
            />
          </FieldGroup>
        </StyledTimesRow>
      </StyledSection>
    </StyledForm>
  )
}
