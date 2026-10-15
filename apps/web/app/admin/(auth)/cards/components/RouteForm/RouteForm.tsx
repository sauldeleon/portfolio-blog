'use client'

import { useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import type { Lang, SummaryRouteData } from '@web/lib/cards'

import { CardDateField } from '../CardDateField'
import { GpxUrlField } from '../GpxUrlField'
import { RouteLandmarksField } from '../RouteLandmarksField'
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
  /** Hides the language toggle when the language is set elsewhere (a post). */
  hideLang?: boolean
}

const LANGS: Lang[] = ['en', 'es']

const SHAPES = ['loop', 'linear'] as const

export function RouteForm({ value, onChange, hideLang }: RouteFormProps) {
  const { t } = useClientTranslation('admin')
  const [placesUnavailable, setPlacesUnavailable] = useState(false)
  function set(patch: Partial<SummaryRouteData>) {
    onChange({ ...value, ...patch })
  }

  return (
    <StyledForm data-testid="route-form">
      {!hideLang && (
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
      )}

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
        <FieldGroup>
          <FieldLabel>{t('cards.fields.routeShape')}</FieldLabel>
          <StyledLangToggle>
            {SHAPES.map((shape) => (
              <Button
                key={shape}
                type="button"
                variant="label"
                active={value.shape === shape}
                aria-pressed={value.shape === shape}
                // A second click clears it: the card then shows no chip.
                onClick={() =>
                  set({ shape: value.shape === shape ? undefined : shape })
                }
                data-testid={`rt-shape-${shape}`}
              >
                {t(`cards.fields.routeShapes.${shape}`)}
              </Button>
            ))}
          </StyledLangToggle>
        </FieldGroup>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t('cards.sections.gpx')}</StyledSectionTitle>
        <GpxUrlField
          value={value.gpxUrl}
          onChange={(gpxUrl) => set({ gpxUrl })}
          onParsed={(m) => {
            setPlacesUnavailable(Boolean(m.placesUnavailable))
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
              shape: m.shape ?? value.shape,
              landmarks: m.landmarks,
            })
          }}
          idPrefix="rt"
          withPlaceNames
        />
        <RouteLandmarksField
          value={value.landmarks}
          onChange={(landmarks) => set({ landmarks })}
          placesUnavailable={placesUnavailable}
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
