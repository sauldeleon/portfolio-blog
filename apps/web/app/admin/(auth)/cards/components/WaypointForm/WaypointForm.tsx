'use client'

import { useMemo, useState } from 'react'

import { Button } from '@sdlgr/button'

import { waypointCard, waypointSlug } from '@web/lib/cards'
import type { Lang } from '@web/lib/cards'

import {
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
} from '../CardGenerator/CardGenerator.styles'
import { CardPreview } from '../CardPreview'
import { DEFAULT_WAYPOINT_STATE, WaypointFields } from '../WaypointFields'
import type { WaypointState } from '../WaypointFields'
import { StyledForm, StyledLangToggle } from './WaypointForm.styles'

const LANGS: Lang[] = ['en', 'es']

/** Build a custom single waypoint card from manual inputs (no GPX). */
export function WaypointForm() {
  const [lang, setLang] = useState<Lang>('en')
  const [data, setData] = useState<WaypointState>(DEFAULT_WAYPOINT_STATE)

  function set(patch: Partial<WaypointState>) {
    setData((d) => ({ ...d, ...patch }))
  }

  const svg = useMemo(
    () =>
      waypointCard({
        name: data.name || 'Waypoint',
        lat: data.lat.trim() === '' ? undefined : Number(data.lat),
        lon: data.lon.trim() === '' ? undefined : Number(data.lon),
        ele: data.ele.trim() === '' ? undefined : Number(data.ele),
        emin: Number(data.emin) || 0,
        emax: Number(data.emax) || 0,
        category: data.category,
        lang,
      }),
    [data, lang],
  )

  const filename = `${lang}_${waypointSlug(data.name || 'waypoint')}`

  return (
    <StyledLayout data-testid="waypoint-form">
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

          <WaypointFields value={data} onChange={set} />
        </StyledForm>
      </StyledPanelForm>

      <StyledPanelPreview>
        <CardPreview
          svg={svg}
          cardWidth={1080}
          cardHeight={320}
          filename={filename}
          disableUpload={data.name.trim() === ''}
        />
      </StyledPanelPreview>
    </StyledLayout>
  )
}
