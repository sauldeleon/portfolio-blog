'use client'

import axios, { isAxiosError } from 'axios'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@sdlgr/button'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'
import {
  svgToPng,
  translateName,
  waypointCard,
  waypointSlug,
  zipStore,
} from '@web/lib/cards'
import type { Lang, Waypoint, ZipFile } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { CardPreview } from '../CardPreview'
import type { CardPreviewHandle } from '../CardPreview'
import { WaypointFields } from '../WaypointFields'
import type { WaypointState } from '../WaypointFields'
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
} from './WaypointGenerator.styles'

const LANGS: Lang[] = ['en', 'es']

const CARD_W = 1080
const CARD_H = 320

/** Extract the GPX file's base name (no extension, percent-decoded) from its URL. */
function gpxBaseName(url: string): string {
  const path = url.split(/[?#]/)[0]
  const raw = path.slice(path.lastIndexOf('/') + 1).replace(/\.gpx$/i, '')
  try {
    // Decode "%20" etc. so spaces survive slugification instead of leaving "20".
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** Map parsed waypoints to editable form state, sharing one altimeter scale. */
function toItems(waypoints: Waypoint[]): WaypointState[] {
  const eles = waypoints.map((w) => w.ele)
  const emin = String(Math.min(...eles))
  const emax = String(Math.max(...eles))
  return waypoints.map((w) => ({
    name: w.name,
    category: w.category,
    lat: String(w.lat),
    lon: String(w.lon),
    ele: String(w.ele),
    emin,
    emax,
  }))
}

/**
 * Generates a series of waypoint banner cards from the `<wpt>` elements of a
 * GPX file fetched through the server proxy. Each card can be clicked to tweak
 * its fields inline before exporting.
 */
export function WaypointGenerator() {
  const { t } = useClientTranslation('admin')
  const [lang, setLang] = useState<Lang>('en')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<WaypointState[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [uploadingAll, setUploadingAll] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  // Captured at parse time so all cards in a batch share one upload signature.
  const [gpxName, setGpxName] = useState('')
  const [stamp, setStamp] = useState(0)
  const cardRefs = useRef<Array<CardPreviewHandle | null>>([])

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setEditing(null)
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
        setItems([])
        return
      }
      setGpxName(waypointSlug(gpxBaseName(url)))
      setStamp(Date.now())
      setItems(toItems(wpts))
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

  function updateItem(patch: Partial<WaypointState>) {
    setItems((prev) =>
      prev.map((item, i) => (i === editing ? { ...item, ...patch } : item)),
    )
  }

  function toggleEdit(index: number) {
    setEditing((cur) => (cur === index ? null : index))
  }

  // Upload each card sequentially, reusing its own upload logic. Cards without
  // a name no-op internally (their upload is disabled).
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

  const cards = useMemo(
    () =>
      items.map((item, i) => {
        const svg = waypointCard({
          name: translateName(item.name, lang),
          lat: item.lat.trim() === '' ? undefined : Number(item.lat),
          lon: item.lon.trim() === '' ? undefined : Number(item.lon),
          ele: item.ele.trim() === '' ? undefined : Number(item.ele),
          emin: Number(item.emin) || 0,
          emax: Number(item.emax) || 0,
          category: item.category,
          lang,
        })
        const nameSlug = waypointSlug(item.name)
        return {
          key: `wp-${i}`,
          svg,
          // Download filename and Cloudinary public_id share this single name.
          filename: `waypoint-${gpxName}-${stamp}-${lang}-${nameSlug}`,
          disableUpload: item.name.trim() === '',
        }
      }),
    [items, lang, gpxName, stamp],
  )

  // Pack every card's PNG into a single uncompressed zip and download it once,
  // avoiding the browser's "download multiple files" prompt.
  async function handleDownloadAll() {
    setDownloadingAll(true)
    try {
      const files: ZipFile[] = []
      for (const card of cards) {
        const blob = await svgToPng(card.svg, CARD_W, CARD_H)
        const data = new Uint8Array(await blob.arrayBuffer())
        files.push({ name: `${card.filename}.png`, data })
      }
      const zipBytes = zipStore(files)
      const url = URL.createObjectURL(
        new Blob([zipBytes], { type: 'application/zip' }),
      )
      const a = document.createElement('a')
      a.href = url
      a.download = `waypoints-${gpxName}-${lang}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloadingAll(false)
    }
  }

  const editItem = editing !== null ? items[editing] : undefined

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

          {editItem && (
            <StyledSection data-testid="wp-editor">
              <StyledSectionTitle>
                {t('cards.sections.editWaypoint')}
              </StyledSectionTitle>
              <WaypointFields value={editItem} onChange={updateItem} />
              <Button
                type="button"
                variant="label"
                onClick={() => setEditing(null)}
                data-testid="wp-editor-close"
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
                data-testid="wp-download-all"
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
                data-testid="wp-upload-all"
              >
                {uploadingAll
                  ? t('cards.actions.uploading')
                  : t('cards.actions.uploadAll')}
              </Button>
            </StyledBulkBar>
            <StyledList data-testid="wp-cards">
              {cards.map((c, i) => (
                <CardPreview
                  key={c.key}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  svg={c.svg}
                  cardWidth={1080}
                  cardHeight={320}
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
