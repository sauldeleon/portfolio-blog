'use client'

import axios, { isAxiosError } from 'axios'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldHelper, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import {
  canyonWaypointCard,
  parseCanyonWaypointsText,
  serializeCanyonWaypoints,
  svgToPng,
  waypointSlug,
  zipStore,
} from '@web/lib/cards'
import type { CanyonWaypoint, Lang, ZipFile } from '@web/lib/cards'

import { CanyonWaypointFields } from '../CanyonWaypointFields'
import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { CardPreview } from '../CardPreview'
import type { CardPreviewHandle } from '../CardPreview'
import {
  StyledBulkBar,
  StyledError,
  StyledForm,
  StyledGpxRow,
  StyledLangToggle,
  StyledList,
  StyledPreviewStack,
  StyledSection,
  StyledSectionTitle,
  StyledTextarea,
} from './CanyonWaypointsGenerator.styles'

const LANGS: Lang[] = ['en', 'es']

/**
 * Builds one card per canyon waypoint. The textarea is the editable source of
 * truth (parsed live into a card list); a GPX url can be imported to pre-fill
 * it. Each card can be downloaded/uploaded on its own, or exported together as
 * a single zip. Card height grows with each waypoint's notes.
 */
export function CanyonWaypointsGenerator() {
  const { t } = useClientTranslation('admin')
  const [lang, setLang] = useState<Lang>('en')
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAll, setUploadingAll] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const cardRefs = useRef<Array<CardPreviewHandle | null>>([])

  const waypoints = useMemo<CanyonWaypoint[]>(
    () => parseCanyonWaypointsText(text),
    [text],
  )

  function toggleEdit(index: number) {
    setEditing((cur) => (cur === index ? null : index))
  }

  // Editing a single card patches its waypoint and rewrites the textarea, which
  // stays the single source of truth (re-parsed into the card list).
  function updateWaypoint(patch: Partial<CanyonWaypoint>) {
    setText(
      serializeCanyonWaypoints(
        waypoints.map((w, i) => (i === editing ? { ...w, ...patch } : w)),
      ),
    )
  }

  const editItem = editing !== null ? waypoints[editing] : undefined

  const base = name.trim() === '' ? 'canyon' : waypointSlug(name)

  const cards = useMemo(
    () =>
      waypoints.map((wp, i) => {
        const { svg, width, height } = canyonWaypointCard({
          lang,
          categories: wp.categories,
          title: wp.title,
          lat: wp.lat,
          lon: wp.lon,
          notes: wp.notes,
          side: wp.side,
          severity: wp.severity,
          meters: wp.meters,
        })
        const order = String(i + 1).padStart(2, '0')
        return {
          key: `cw-${i}`,
          svg,
          width,
          height,
          filename: `canyon-waypoint-${base}-${lang}-${order}-${waypointSlug(wp.title)}`,
          disableUpload: wp.title.trim() === '',
        }
      }),
    [waypoints, lang, base],
  )

  async function handleImport() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<{ data?: CanyonWaypoint[] }>(
        '/api/cards/canyon-waypoints',
        { params: { url } },
      )
      const wpts = res.data.data
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
      setError(
        isAxiosError(err)
          ? (err.response?.data?.error ?? t('cards.errors.gpxParse'))
          : t('cards.errors.gpxParse'),
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadAll() {
    setUploadingAll(true)
    try {
      for (const card of cardRefs.current) {
        await card?.upload()
      }
    } finally {
      setUploadingAll(false)
    }
  }

  async function handleDownloadAll() {
    setDownloadingAll(true)
    try {
      const files: ZipFile[] = []
      for (const card of cards) {
        const blob = await svgToPng(card.svg, card.width, card.height)
        const data = new Uint8Array(await blob.arrayBuffer())
        files.push({ name: `${card.filename}.png`, data })
      }
      const zipBytes = zipStore(files)
      const href = URL.createObjectURL(
        new Blob([zipBytes], { type: 'application/zip' }),
      )
      const a = document.createElement('a')
      a.href = href
      a.download = `canyon-waypoints-${base}-${lang}.zip`
      a.click()
      URL.revokeObjectURL(href)
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <StyledLayout data-testid="canyon-waypoints-generator">
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
                data-testid={`cw-lang-${l}`}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </StyledLangToggle>

          <StyledSection>
            <StyledSectionTitle>{t('cards.sections.files')}</StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cw-name">
                {t('cards.fields.fileNamePrefix')}
              </FieldLabel>
              <Input
                id="cw-name"
                value={name}
                placeholder={t('cards.placeholders.canyonName')}
                onChange={(e) => setName(e.target.value)}
                data-testid="cw-name"
              />
              <FieldHelper>
                {t('cards.fields.fileNamePrefixHelper')}
              </FieldHelper>
            </FieldGroup>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>{t('cards.sections.gpx')}</StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cw-gpx">
                {t('cards.fields.gpxUrl')}
              </FieldLabel>
              <StyledGpxRow>
                <Input
                  id="cw-gpx"
                  value={url}
                  placeholder={t('cards.placeholders.gpxUrl')}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (error) setError(null)
                  }}
                  data-testid="cw-gpx"
                />
                <Button
                  type="button"
                  variant="contained"
                  colorScheme="success"
                  size="sm"
                  onClick={() => void handleImport()}
                  disabled={!url || loading}
                  data-testid="cw-import"
                >
                  {loading
                    ? t('cards.actions.parsing')
                    : t('cards.actions.parse')}
                </Button>
              </StyledGpxRow>
              {error && (
                <StyledError data-testid="cw-error">{error}</StyledError>
              )}
            </FieldGroup>
          </StyledSection>

          <StyledSection>
            <StyledSectionTitle>
              {t('cards.sections.waypointsText')}
            </StyledSectionTitle>
            <FieldGroup>
              <FieldLabel htmlFor="cw-text">
                {t('cards.fields.waypointsText')}
              </FieldLabel>
              <StyledTextarea
                id="cw-text"
                value={text}
                placeholder={t('cards.placeholders.waypointsText')}
                onChange={(e) => setText(e.target.value)}
                data-testid="cw-text"
              />
            </FieldGroup>
          </StyledSection>

          {editItem && (
            <StyledSection data-testid="cw-editor">
              <StyledSectionTitle>
                {t('cards.sections.editWaypoint')}
              </StyledSectionTitle>
              <CanyonWaypointFields
                value={editItem}
                onChange={updateWaypoint}
              />
              <Button
                type="button"
                variant="label"
                onClick={() => setEditing(null)}
                data-testid="cw-editor-close"
              >
                {t('cards.actions.done')}
              </Button>
            </StyledSection>
          )}
        </StyledForm>
      </StyledPanelForm>

      <StyledPanelPreview>
        {cards.length > 0 && (
          <StyledPreviewStack>
            <StyledBulkBar>
              <Button
                type="button"
                variant="contained"
                colorScheme="success"
                size="sm"
                onClick={() => void handleDownloadAll()}
                disabled={downloadingAll}
                data-testid="cw-download-all"
              >
                {downloadingAll
                  ? t('cards.actions.downloading')
                  : t('cards.actions.downloadAll')}
              </Button>
              <Button
                type="button"
                variant="contained"
                colorScheme="success"
                size="sm"
                onClick={() => void handleUploadAll()}
                disabled={uploadingAll}
                data-testid="cw-upload-all"
              >
                {uploadingAll
                  ? t('cards.actions.uploading')
                  : t('cards.actions.uploadAll')}
              </Button>
            </StyledBulkBar>
            <StyledList data-testid="cw-cards">
              {cards.map((c, i) => (
                <CardPreview
                  key={c.key}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  svg={c.svg}
                  cardWidth={c.width}
                  cardHeight={c.height}
                  filename={c.filename}
                  disableUpload={c.disableUpload}
                  onSelect={() => toggleEdit(i)}
                  selected={editing === i}
                />
              ))}
            </StyledList>
          </StyledPreviewStack>
        )}
      </StyledPanelPreview>
    </StyledLayout>
  )
}
