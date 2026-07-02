'use client'

import { useMemo, useState } from 'react'

import { Button } from '@sdlgr/button'

import { useClientTranslation } from '@web/i18n/client'
import { renderCard } from '@web/lib/cards'
import type {
  CanyoningCardData,
  CardSpec,
  SummaryFerrataData,
  SummaryRouteData,
} from '@web/lib/cards'

import { CanyonWaypointsGenerator } from '../CanyonWaypointsGenerator'
import { CanyoningForm } from '../CanyoningForm'
import { CardPreview } from '../CardPreview'
import { CroquisGenerator } from '../CroquisGenerator'
import { FerrataForm } from '../FerrataForm'
import { RouteForm } from '../RouteForm'
import { WaypointForm } from '../WaypointForm'
import { WaypointGenerator } from '../WaypointGenerator'
import {
  StyledCardTypeRow,
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
  StyledTitle,
  StyledWrapper,
} from './CardGenerator.styles'

type CardKind = CardSpec['kind']
type Tab =
  | CardKind
  | 'waypoints'
  | 'waypoint-single'
  | 'canyon-waypoints'
  | 'croquis'

const TABS: Array<{ kind: Tab; labelKey: string }> = [
  { kind: 'summary-route', labelKey: 'cards.tabs.route' },
  { kind: 'canyoning-data', labelKey: 'cards.tabs.canyonData' },
  { kind: 'canyon-waypoints', labelKey: 'cards.tabs.canyonWaypoints' },
  { kind: 'croquis', labelKey: 'cards.tabs.croquis' },
  { kind: 'summary-ferrata', labelKey: 'cards.tabs.ferrata' },
  { kind: 'waypoints', labelKey: 'cards.tabs.waypointsGpx' },
  { kind: 'waypoint-single', labelKey: 'cards.tabs.waypointSingle' },
]

const NON_SPEC_TABS: Tab[] = [
  'waypoints',
  'waypoint-single',
  'canyon-waypoints',
  'croquis',
]

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

  function handleKindChange(kind: Tab) {
    setActiveKind(kind)
    if (!NON_SPEC_TABS.includes(kind)) {
      setSpec(defaultSpec(kind as CardKind))
    }
  }

  const svg = useMemo(() => renderCard(spec), [spec])

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
            <CardPreview
              svg={svg}
              cardWidth={1600}
              cardHeight={900}
              filename={filename}
            />
          </StyledPanelPreview>
        </StyledLayout>
      )}
    </StyledWrapper>
  )
}
