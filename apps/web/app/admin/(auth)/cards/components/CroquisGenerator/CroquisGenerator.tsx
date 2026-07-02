'use client'

import { useMemo, useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldHelper, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import {
  parseCanyonWaypointsText,
  serializeCanyonWaypoints,
  toCroquisObstacles,
  waypointSlug,
} from '@web/lib/cards'
import type { Lang } from '@web/lib/cards'
import {
  axiosErrorMessage,
  fetchCanyonWaypoints,
} from '@web/lib/cards/gpxImport'

import {
  StyledError,
  StyledForm,
  StyledGpxRow,
  StyledLangToggle,
  StyledSection,
  StyledSectionTitle,
  StyledTextarea,
} from '../CanyonWaypointsGenerator/CanyonWaypointsGenerator.styles'
import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { Croquis } from '../Croquis'
import { StyledEmpty } from './CroquisGenerator.styles'

const LANGS: Lang[] = ['en', 'es']

/**
 * Builds an interactive canyon croquis (river schematic) from the same waypoint
 * text as the waypoint-card generator. Only jump / rappel / slide obstacles are
 * drawn; the result can be explored on hover and exported to a PNG.
 */
export function CroquisGenerator() {
  const { t } = useClientTranslation('admin')
  const [lang, setLang] = useState<Lang>('en')
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const obstacles = useMemo(
    () => toCroquisObstacles(parseCanyonWaypointsText(text)),
    [text],
  )

  const base = name.trim() === '' ? 'croquis' : waypointSlug(name)
  const filename = `croquis-${base}-${lang}`

  async function handleImport() {
    setLoading(true)
    setError(null)
    try {
      const wpts = await fetchCanyonWaypoints(url)
      if (!wpts) {
        setError(t('cards.errors.gpxParse'))
        return
      }
      if (wpts.length === 0) {
        setError(t('cards.errors.noWaypointsFound'))
        return
      }
      setText(serializeCanyonWaypoints(wpts))
    } catch (err) {
      setError(axiosErrorMessage(err, t('cards.errors.gpxParse')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledLayout data-testid="croquis-generator">
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
                data-testid={`cg-lang-${l}`}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </StyledLangToggle>

          <StyledSection>
            <StyledSectionTitle>{t('cards.sections.files')}</StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cg-name">
                {t('cards.fields.fileNamePrefix')}
              </FieldLabel>
              <Input
                id="cg-name"
                value={name}
                placeholder={t('cards.placeholders.canyonName')}
                onChange={(e) => setName(e.target.value)}
                data-testid="cg-name"
              />
              <FieldHelper>
                {t('cards.fields.fileNamePrefixHelper')}
              </FieldHelper>
            </FieldGroup>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>{t('cards.sections.gpx')}</StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cg-gpx">
                {t('cards.fields.gpxUrl')}
              </FieldLabel>
              <StyledGpxRow>
                <Input
                  id="cg-gpx"
                  value={url}
                  placeholder={t('cards.placeholders.gpxUrl')}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  data-testid="cg-gpx"
                />
                <Button
                  type="button"
                  variant="contained"
                  colorScheme="success"
                  size="sm"
                  onClick={() => void handleImport()}
                  disabled={!url || loading}
                  data-testid="cg-import"
                >
                  {loading
                    ? t('cards.actions.parsing')
                    : t('cards.actions.parse')}
                </Button>
              </StyledGpxRow>
              {error && (
                <StyledError data-testid="cg-error">{error}</StyledError>
              )}
            </FieldGroup>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>
              {t('cards.sections.waypointsText')}
            </StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cg-text">
                {t('cards.fields.waypointsText')}
              </FieldLabel>
              <StyledTextarea
                id="cg-text"
                value={text}
                placeholder={t('cards.placeholders.waypointsText')}
                onChange={(e) => setText(e.target.value)}
                data-testid="cg-text"
              />
            </FieldGroup>
          </StyledSection>
        </StyledForm>
      </StyledPanelForm>

      <StyledPanelPreview>
        {obstacles.length > 0 ? (
          <Croquis obstacles={obstacles} lang={lang} filename={filename} />
        ) : (
          <StyledEmpty data-testid="cg-empty">
            {t('cards.croquis.empty')}
          </StyledEmpty>
        )}
      </StyledPanelPreview>
    </StyledLayout>
  )
}
