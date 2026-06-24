'use client'

import axios, { isAxiosError } from 'axios'
import { useMemo, useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import { translateName, waypointCard, waypointSlug } from '@web/lib/cards'
import type { Lang, Waypoint } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { CardPreview } from '../CardPreview'
import {
  StyledError,
  StyledForm,
  StyledGpxRow,
  StyledLangToggle,
  StyledList,
  StyledSection,
  StyledSectionTitle,
} from './WaypointGenerator.styles'

const LANGS: Lang[] = ['en', 'es']

/**
 * Generates a series of waypoint banner cards from the `<wpt>` elements of a
 * GPX file fetched through the server proxy.
 */
export function WaypointGenerator() {
  const { t } = useClientTranslation('admin')
  const [lang, setLang] = useState<Lang>('en')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<{ data?: Waypoint[] }>(
        '/api/cards/waypoints',
        { params: { url } },
      )
      const wpts = res.data.data
      if (!wpts) {
        setError(t('cards.errors.gpxParse'))
        return
      }
      if (wpts.length === 0) {
        setError(t('cards.errors.noWaypoints'))
        setWaypoints([])
        return
      }
      setWaypoints(wpts)
    } catch (err) {
      setError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? t('cards.errors.gpxParse'))
          : t('cards.errors.gpxParse'),
      )
    } finally {
      setLoading(false)
    }
  }

  const cards = useMemo(() => {
    if (waypoints.length === 0) return []
    const eles = waypoints.map((w) => w.ele)
    const emin = Math.min(...eles)
    const emax = Math.max(...eles)
    return waypoints.map((w, i) => {
      const name = translateName(w.name, lang)
      const svg = waypointCard({
        name,
        lat: w.lat,
        lon: w.lon,
        ele: w.ele,
        emin,
        emax,
        category: w.category,
        lang,
      })
      return {
        key: `${i}-${w.lat}-${w.lon}`,
        svg,
        filename: `${lang}_${waypointSlug(w.name)}`,
      }
    })
  }, [waypoints, lang])

  return (
    <StyledLayout data-testid="waypoint-generator">
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
            <StyledSectionTitle>{t('cards.sections.gpx')}</StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="wp-gpx">
                {t('cards.fields.gpxUrl')}
              </FieldLabel>
              <StyledGpxRow>
                <Input
                  id="wp-gpx"
                  value={url}
                  placeholder={t('cards.placeholders.gpxUrl')}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  data-testid="wp-gpx"
                />
                <Button
                  type="button"
                  variant="contained"
                  colorScheme="success"
                  size="sm"
                  onClick={() => void handleGenerate()}
                  disabled={!url || loading}
                  data-testid="wp-generate"
                >
                  {loading
                    ? t('cards.actions.generating')
                    : t('cards.actions.generate')}
                </Button>
              </StyledGpxRow>
              {error && (
                <StyledError data-testid="wp-error">{error}</StyledError>
              )}
            </FieldGroup>
          </StyledSection>
        </StyledForm>
      </StyledPanelForm>

      <StyledPanelPreview>
        {cards.length > 0 && (
          <StyledList data-testid="wp-cards">
            {cards.map((c) => (
              <CardPreview
                key={c.key}
                svg={c.svg}
                cardWidth={1080}
                cardHeight={320}
                filename={c.filename}
              />
            ))}
          </StyledList>
        )}
      </StyledPanelPreview>
    </StyledLayout>
  )
}
