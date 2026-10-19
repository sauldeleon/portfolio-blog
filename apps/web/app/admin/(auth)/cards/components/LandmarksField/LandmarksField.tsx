'use client'

import { Button } from '@sdlgr/button'
import { Checkbox } from '@sdlgr/checkbox'
import { FieldGroup, FieldLabel, Input } from '@sdlgr/input'
import { Select, type SelectOption } from '@sdlgr/select'

import { useClientTranslation } from '@web/i18n/client'
import {
  STRINGS,
  WAYPOINT_CATEGORY_KEYS,
  landmarkMarkerSvg,
} from '@web/lib/cards'
import type {
  LandmarkLabels,
  ProfileLandmarks,
  RouteLandmark,
} from '@web/lib/cards'

import {
  StyledAltitude,
  StyledEmpty,
  StyledList,
  StyledModes,
  StyledRow,
  StyledTypeOption,
} from './LandmarksField.styles'

interface LandmarksFieldProps {
  /** The card data's profile spots, their label mode and the GPS note. */
  value: ProfileLandmarks
  onChange: (patch: ProfileLandmarks) => void
  /** OpenStreetMap did not answer on the last parse: some names are missing. */
  placesUnavailable?: boolean
  /** Prefix of the field ids and test ids. */
  idPrefix: string
}

const MODES: LandmarkLabels[] = ['auto', 'names', 'legend', 'markers']

/** "Mountain hut" from the card's "MOUNTAIN HUT". */
function categoryLabel(category: string): string {
  const categories: Record<string, string> = STRINGS.en.categories
  const label = categories[category]
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
}

/** A landmark's type as one select value: `peak`, `col` or `point:<category>`. */
function typeValue(l: RouteLandmark): string {
  return l.kind === 'point' ? `point:${l.category ?? 'info'}` : l.kind
}

/** A type option with the very marker the card draws for it. */
function typeOption(option: SelectOption) {
  const { kind, category } = typePatch(option.value)
  return (
    <StyledTypeOption>
      <svg
        viewBox="0 0 28 28"
        width="20"
        height="20"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: landmarkMarkerSvg({ kind, category }, 14, 14),
        }}
      />
      {option.label}
    </StyledTypeOption>
  )
}

function typePatch(value: string): Pick<RouteLandmark, 'kind' | 'category'> {
  if (value === 'peak' || value === 'col') {
    return { kind: value, category: undefined }
  }
  return { kind: 'point', category: value.slice('point:'.length) }
}

/**
 * A stable key per row. Several waypoints can sit on the same profile sample
 * (short canyons), so the key is their position, numbered when repeated.
 */
function rowKey(list: RouteLandmark[], i: number): string {
  const id = (l: RouteLandmark) => `${l.kind}-${l.lat}-${l.lon}-${l.index}`
  const own = id(list[i])
  const repeat = list.slice(0, i).filter((l) => id(l) === own).length
  return `${own}-${repeat}`
}

/**
 * The spots found when parsing the GPX (its waypoints plus detected summits
 * and cols), in route order: each one's type and name can be fixed, and any
 * of them hidden from the card or dropped.
 */
export function LandmarksField({
  value,
  onChange,
  placesUnavailable,
  idPrefix,
}: LandmarksFieldProps) {
  const { t } = useClientTranslation('admin')
  const spots = value.landmarks ?? []
  const labels = value.landmarkLabels ?? 'names'
  const setSpots = (landmarks: RouteLandmark[]) => onChange({ landmarks })

  // GPX symbols are not always right (a summit tagged "Information"): the
  // type of each spot can be changed here.
  const typeOptions: SelectOption[] = [
    { value: 'peak', label: t('cards.fields.landmarkPeak') },
    { value: 'col', label: t('cards.fields.landmarkCol') },
    ...WAYPOINT_CATEGORY_KEYS.filter((k) => k !== 'summit').map((k) => ({
      value: `point:${k}`,
      label: categoryLabel(k),
    })),
  ]

  function patch(i: number, change: Partial<RouteLandmark>) {
    setSpots(spots.map((l, k) => (k === i ? { ...l, ...change } : l)))
  }

  return (
    <FieldGroup>
      <FieldLabel>{t('cards.fields.landmarks')}</FieldLabel>
      {placesUnavailable && (
        <StyledEmpty
          role="status"
          data-testid={`${idPrefix}-landmarks-osm-down`}
        >
          {t('cards.fields.landmarksOsmDown')}
        </StyledEmpty>
      )}
      {spots.length > 0 && (
        <>
          <StyledModes
            role="group"
            aria-label={t('cards.fields.landmarkLabels')}
          >
            {MODES.map((mode) => (
              <Button
                key={mode}
                type="button"
                variant="label"
                active={labels === mode}
                aria-pressed={labels === mode}
                onClick={() => onChange({ landmarkLabels: mode })}
                data-testid={`${idPrefix}-labels-${mode}`}
              >
                {t(`cards.fields.landmarkModes.${mode}`)}
              </Button>
            ))}
          </StyledModes>
          <StyledEmpty>
            {t(`cards.fields.landmarkModeHints.${labels}`)}
          </StyledEmpty>
          <Checkbox
            id={`${idPrefix}-landmark-altitude`}
            label={t('cards.fields.landmarkAltitude')}
            checked={spots.every((l) => !l.hideAltitude)}
            onChange={(show) =>
              setSpots(
                spots.map((l) => ({
                  ...l,
                  hideAltitude: show ? undefined : true,
                })),
              )
            }
          />
        </>
      )}
      {spots.length === 0 ? (
        <StyledEmpty>{t('cards.fields.landmarksEmpty')}</StyledEmpty>
      ) : (
        <StyledList data-testid={`${idPrefix}-landmarks`}>
          {spots.map((l, i) => (
            <StyledRow key={rowKey(spots, i)} $hidden={Boolean(l.hidden)}>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => patch(i, { hidden: !l.hidden || undefined })}
                aria-pressed={!l.hidden}
                aria-label={t(
                  l.hidden
                    ? 'cards.fields.landmarkShow'
                    : 'cards.fields.landmarkHide',
                )}
                title={t(
                  l.hidden
                    ? 'cards.fields.landmarkShow'
                    : 'cards.fields.landmarkHide',
                )}
                data-testid={`${idPrefix}-landmark-toggle-${i}`}
              >
                {l.hidden ? '◌' : '●'}
              </Button>
              <Select
                id={`${idPrefix}-landmark-type-${i}`}
                value={typeValue(l)}
                onChange={(type) => patch(i, typePatch(type))}
                options={typeOptions}
                formatOptionLabel={typeOption}
                data-testid={`${idPrefix}-landmark-type-${i}`}
              />
              <StyledAltitude>
                <Checkbox
                  id={`${idPrefix}-landmark-alt-${i}`}
                  label={`${l.ele} m`}
                  checked={!l.hideAltitude}
                  onChange={(show) =>
                    patch(i, { hideAltitude: show ? undefined : true })
                  }
                />
              </StyledAltitude>
              <Input
                value={l.name ?? ''}
                placeholder={t('cards.fields.landmarkName')}
                aria-label={t('cards.fields.landmarkName')}
                onChange={(e) =>
                  patch(i, { name: e.target.value || undefined })
                }
                data-testid={`${idPrefix}-landmark-name-${i}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setSpots(spots.filter((_, k) => k !== i))}
                aria-label={t('cards.fields.landmarkRemove')}
                title={t('cards.fields.landmarkRemove')}
                data-testid={`${idPrefix}-landmark-remove-${i}`}
              >
                ✕
              </Button>
            </StyledRow>
          ))}
        </StyledList>
      )}
      <Checkbox
        id={`${idPrefix}-altitude-note`}
        label={t('cards.fields.altitudeNote')}
        checked={value.altitudeNote !== false}
        onChange={(altitudeNote) => onChange({ altitudeNote })}
      />
    </FieldGroup>
  )
}
