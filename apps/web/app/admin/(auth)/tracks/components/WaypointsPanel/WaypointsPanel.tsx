'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'
import { type GpxWaypoint, WPT_ICON_URLS } from '@sdlgr/gpx-tools'
import { ChevronIcon } from '@sdlgr/icons'
import { Input, Textarea } from '@sdlgr/input'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledDragHandle,
  StyledEmpty,
  StyledField,
  StyledForm,
  StyledHelp,
  StyledItem,
  StyledItemHeader,
  StyledItemRow,
  StyledList,
  StyledMoveIcon,
  StyledPanel,
  StyledSymbols,
} from './WaypointsPanel.styles'

/** Garmin `<sym>` values offered as quick picks, one per map icon style. */
export const WAYPOINT_SYMBOLS = [
  'Information',
  'Warning',
  'Summit',
  'Water Source',
  'Drinking Water',
  'Campground',
  'Lodging',
  'Trail Head',
  'Restaurant',
  'Parking Area',
  'First Aid',
  'Bike Trail',
  'Scenic Area',
]

function iconFor(sym: string): string {
  return WPT_ICON_URLS[sym] ?? WPT_ICON_URLS['']
}

export interface WaypointsPanelProps {
  waypoints: GpxWaypoint[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<GpxWaypoint>) => void
  onDelete: (id: string) => void
  /** Moves the waypoint at `from` to position `to`. */
  onMove: (from: number, to: number) => void
  addMode: boolean
  onToggleAddMode: () => void
  /** A just-added waypoint: its name is focused, ready to type over. */
  focusNameId?: string | null
}

export function WaypointsPanel({
  waypoints,
  selectedId,
  onSelect,
  onChange,
  onDelete,
  onMove,
  addMode,
  onToggleAddMode,
  focusNameId = null,
}: WaypointsPanelProps) {
  const { t } = useClientTranslation('admin')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focusNameId) return
    const input = panelRef.current?.querySelector<HTMLInputElement>(
      `[data-testid="waypoint-item-${focusNameId}"] [data-testid="waypoint-name"]`,
    )
    if (!input) return
    input.scrollIntoView?.({ block: 'nearest' })
    input.focus()
    input.select()
  }, [focusNameId])
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  function endDrag() {
    setDragFrom(null)
    setDragOver(null)
  }

  // Text fields commit on blur so typing does not flood the undo history. The
  // value is part of the key so undo/redo refreshes the uncontrolled input.
  function commit(
    w: GpxWaypoint,
    field: 'name' | 'desc' | 'sym',
    value: string,
  ) {
    if (value !== w[field]) onChange(w.id, { [field]: value })
  }

  return (
    <StyledPanel ref={panelRef} data-testid="waypoints-panel">
      <StyledHelp>{t('tracks.waypoints.help')}</StyledHelp>
      <Button
        variant="label"
        type="button"
        active={addMode}
        aria-pressed={addMode}
        onClick={onToggleAddMode}
        data-testid="toggle-add-waypoint"
      >
        {addMode ? t('tracks.waypoints.addOn') : t('tracks.waypoints.addOff')}
      </Button>

      {waypoints.length === 0 && (
        <StyledEmpty>{t('tracks.waypoints.empty')}</StyledEmpty>
      )}
      <StyledList>
        {waypoints.map((w, index) => {
          const isSelected = w.id === selectedId
          return (
            <StyledItem
              key={w.id}
              $selected={isSelected}
              $dropTarget={dragOver === index && dragFrom !== index}
              onDragOver={(e) => {
                if (dragFrom === null) return
                e.preventDefault()
                setDragOver(index)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragFrom !== null) onMove(dragFrom, index)
                endDrag()
              }}
              data-testid={`waypoint-item-${w.id}`}
            >
              <StyledItemRow>
                <StyledDragHandle
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer?.setData('text/plain', w.id)
                    setDragFrom(index)
                  }}
                  onDragEnd={endDrag}
                  title={t('tracks.waypoints.drag')}
                  aria-hidden="true"
                  data-testid={`waypoint-drag-${w.id}`}
                >
                  ⋮⋮
                </StyledDragHandle>
                <StyledItemHeader
                  type="button"
                  onClick={() => onSelect(isSelected ? null : w.id)}
                  aria-expanded={isSelected}
                  data-testid={`waypoint-${w.id}`}
                >
                  <img src={iconFor(w.sym)} alt="" width={15} height={20} />
                  <span>{w.name || t('tracks.waypoints.unnamed')}</span>
                </StyledItemHeader>
                <Button
                  variant="ghost"
                  size="xs"
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  aria-label={t('tracks.waypoints.moveUp')}
                  title={t('tracks.waypoints.moveUp')}
                  data-testid={`waypoint-up-${w.id}`}
                >
                  <StyledMoveIcon $direction="up">
                    <ChevronIcon />
                  </StyledMoveIcon>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === waypoints.length - 1}
                  aria-label={t('tracks.waypoints.moveDown')}
                  title={t('tracks.waypoints.moveDown')}
                  data-testid={`waypoint-down-${w.id}`}
                >
                  <StyledMoveIcon $direction="down">
                    <ChevronIcon />
                  </StyledMoveIcon>
                </Button>
              </StyledItemRow>
              {isSelected && (
                <StyledForm>
                  <StyledField>
                    <span>{t('tracks.waypoints.name')}</span>
                    <Input
                      key={`name-${w.name}`}
                      defaultValue={w.name}
                      onBlur={(e) => commit(w, 'name', e.target.value)}
                      onKeyDown={(e) => {
                        // Enter confirms, ready for the next map click.
                        if (e.key === 'Enter') e.currentTarget.blur()
                      }}
                      data-testid="waypoint-name"
                    />
                  </StyledField>
                  <Checkbox
                    id={`waypoint-snap-${w.id}`}
                    label={t('tracks.waypoints.snap')}
                    checked={Boolean(w.snap)}
                    onChange={(snap) => onChange(w.id, { snap })}
                  />
                  <StyledField>
                    <span>{t('tracks.waypoints.desc')}</span>
                    <Textarea
                      key={`desc-${w.desc}`}
                      defaultValue={w.desc}
                      rows={4}
                      onBlur={(e) => commit(w, 'desc', e.target.value)}
                      data-testid="waypoint-desc"
                    />
                  </StyledField>
                  <StyledField as="div">
                    <span>{t('tracks.waypoints.icon')}</span>
                    <StyledSymbols>
                      {WAYPOINT_SYMBOLS.map((sym) => (
                        <Button
                          variant="label"
                          key={sym}
                          type="button"
                          title={sym}
                          aria-label={sym}
                          aria-pressed={w.sym === sym}
                          active={w.sym === sym}
                          onClick={() => commit(w, 'sym', sym)}
                          data-testid={`symbol-${sym}`}
                        >
                          <img
                            src={iconFor(sym)}
                            alt=""
                            width={15}
                            height={20}
                          />
                        </Button>
                      ))}
                    </StyledSymbols>
                    <Input
                      key={`sym-${w.sym}`}
                      defaultValue={w.sym}
                      placeholder={t('tracks.waypoints.symPlaceholder')}
                      onBlur={(e) => commit(w, 'sym', e.target.value)}
                      data-testid="waypoint-sym"
                    />
                  </StyledField>
                  <Button
                    variant="contained"
                    size="xs"
                    colorScheme="danger"
                    type="button"
                    onClick={() => onDelete(w.id)}
                    data-testid="delete-waypoint"
                  >
                    {t('tracks.waypoints.delete')}
                  </Button>
                </StyledForm>
              )}
            </StyledItem>
          )
        })}
      </StyledList>
    </StyledPanel>
  )
}
