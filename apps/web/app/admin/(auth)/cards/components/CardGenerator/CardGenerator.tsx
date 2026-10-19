'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'

import { useClientTranslation } from '@web/i18n/client'
import { buildCard } from '@web/lib/cards'
import type {
  CanyoningCardData,
  CardSpec,
  SummaryFerrataData,
  SummaryRouteData,
} from '@web/lib/cards'

import { CanyonSummary } from '../CanyonSummary'
import { CanyonWaypointsGenerator } from '../CanyonWaypointsGenerator'
import { CanyoningForm } from '../CanyoningForm'
import { CardPreview } from '../CardPreview'
import { CroquisGenerator } from '../CroquisGenerator'
import { FerrataForm } from '../FerrataForm'
import { FerrataSummary } from '../FerrataSummary'
import { RouteForm } from '../RouteForm'
import { RouteSummary } from '../RouteSummary'
import { WaypointForm } from '../WaypointForm'
import { WaypointGenerator } from '../WaypointGenerator'
import {
  StyledCardTypeRow,
  StyledInteractiveToggle,
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
  StyledTitle,
  StyledWrapper,
} from './CardGenerator.styles'

type CardKind = CardSpec['kind']
type Tab =
  CardKind | 'waypoints' | 'waypoint-single' | 'canyon-waypoints' | 'croquis'

const TABS = [
  { kind: 'summary-route', labelKey: 'cards.tabs.route' },
  { kind: 'canyoning-data', labelKey: 'cards.tabs.canyonData' },
  { kind: 'canyon-waypoints', labelKey: 'cards.tabs.canyonWaypoints' },
  { kind: 'croquis', labelKey: 'cards.tabs.croquis' },
  { kind: 'summary-ferrata', labelKey: 'cards.tabs.ferrata' },
  { kind: 'waypoints', labelKey: 'cards.tabs.waypointsGpx' },
  { kind: 'waypoint-single', labelKey: 'cards.tabs.waypointSingle' },
] as const satisfies ReadonlyArray<{ kind: Tab; labelKey: string }>

const NON_SPEC_TABS: Tab[] = [
  'waypoints',
  'waypoint-single',
  'canyon-waypoints',
  'croquis',
]

/** Remembers whether the preview is the interactive card. */
const INTERACTIVE_KEY = 'admin.cards.interactive'
const interactiveListeners = new Set<() => void>()
// Fallback when storage is blocked: the choice lasts until a reload.
let interactiveMemory = false

function readInteractive(): boolean {
  try {
    return window.localStorage.getItem(INTERACTIVE_KEY) === '1'
  } catch {
    return interactiveMemory
  }
}

function saveInteractive(on: boolean) {
  interactiveMemory = on
  try {
    window.localStorage.setItem(INTERACTIVE_KEY, on ? '1' : '0')
  } catch {
    // Storage blocked: the choice is kept in memory only.
  }
  interactiveListeners.forEach((listener) => listener())
}

function subscribeInteractive(listener: () => void) {
  interactiveListeners.add(listener)
  return () => {
    interactiveListeners.delete(listener)
  }
}

const DEFAULT_CANYONING: CanyoningCardData = {
  kind: 'canyoning-data',
  lang: 'en',
}
const DEFAULT_ROUTE: SummaryRouteData = { kind: 'summary-route', lang: 'en' }
const DEFAULT_FERRATA: SummaryFerrataData = {
  kind: 'summary-ferrata',
  lang: 'en',
}

function defaultSpec(kind: CardKind): CardSpec {
  switch (kind) {
    case 'canyoning-data':
      return { ...DEFAULT_CANYONING }
    case 'summary-route':
      return { ...DEFAULT_ROUTE }
    case 'summary-ferrata':
      return { ...DEFAULT_FERRATA }
  }
}

function cardSlug(kind: CardKind): string {
  switch (kind) {
    case 'canyoning-data':
      return 'canyoning'
    case 'summary-route':
      return 'route'
    case 'summary-ferrata':
      return 'ferrata'
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CardGenerator() {
  const { t } = useClientTranslation('admin')
  const [activeKind, setActiveKind] = useState<Tab>('summary-route')
  const [spec, setSpec] = useState<CardSpec>(defaultSpec('summary-route'))
  // Static PNG preview, or the explorable card built from the same data.
  const interactive = useSyncExternalStore(
    subscribeInteractive,
    readInteractive,
    // Server render: static until the stored choice is read.
    /* istanbul ignore next */
    () => false,
  )

  function handleKindChange(kind: Tab) {
    setActiveKind(kind)
    if (!NON_SPEC_TABS.includes(kind)) {
      setSpec(defaultSpec(kind as CardKind))
    }
  }

  // Route cards with a legend grow taller, so the size comes from the card.
  const card = useMemo(() => buildCard(spec), [spec])

  const filename = useMemo(() => {
    const slug = cardSlug(spec.kind)
    const base = spec.title ? slugify(spec.title) : slug
    const date = spec.date ? `${slugify(spec.date)}_` : ''
    const lang = spec.lang
    return `${date}${lang}_${slug}_${base}`
  }, [spec])

  return (
    <StyledWrapper data-testid="card-generator">
      <StyledTitle>{t('cards.title')}</StyledTitle>

      <StyledCardTypeRow>
        {TABS.map(({ kind, labelKey }) => (
          <Button
            key={kind}
            type="button"
            variant="label"
            active={activeKind === kind}
            onClick={() => handleKindChange(kind)}
            data-testid={`card-type-${kind}`}
          >
            {t(labelKey)}
          </Button>
        ))}
        {!NON_SPEC_TABS.includes(activeKind) && (
          <StyledInteractiveToggle>
            <Checkbox
              id="card-interactive"
              label={t('cards.interactive')}
              checked={interactive}
              onChange={saveInteractive}
            />
          </StyledInteractiveToggle>
        )}
      </StyledCardTypeRow>

      {activeKind === 'waypoints' ? (
        <WaypointGenerator />
      ) : activeKind === 'waypoint-single' ? (
        <WaypointForm />
      ) : activeKind === 'canyon-waypoints' ? (
        <CanyonWaypointsGenerator />
      ) : activeKind === 'croquis' ? (
        <CroquisGenerator />
      ) : (
        <StyledLayout>
          <StyledPanelForm>
            {spec.kind === 'canyoning-data' && (
              <CanyoningForm value={spec} onChange={(next) => setSpec(next)} />
            )}
            {spec.kind === 'summary-route' && (
              <RouteForm value={spec} onChange={(next) => setSpec(next)} />
            )}
            {spec.kind === 'summary-ferrata' && (
              <FerrataForm value={spec} onChange={(next) => setSpec(next)} />
            )}
          </StyledPanelForm>

          <StyledPanelPreview>
            {!interactive ? (
              <CardPreview
                svg={card.svg}
                cardWidth={card.width}
                cardHeight={card.height}
                filename={filename}
              />
            ) : spec.kind === 'canyoning-data' ? (
              <CanyonSummary data={spec} filename={filename} />
            ) : spec.kind === 'summary-route' ? (
              <RouteSummary data={spec} filename={filename} />
            ) : (
              <FerrataSummary data={spec} filename={filename} />
            )}
          </StyledPanelPreview>
        </StyledLayout>
      )}
    </StyledWrapper>
  )
}
