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
import type { LandmarkLabels, RouteLandmark } from '@web/lib/cards'

import {
  StyledAltitude,
  StyledEmpty,
  StyledList,
  StyledModes,
  StyledRow,
  StyledTypeOption,
} from './RouteLandmarksField.styles'

interface RouteLandmarksFieldProps {
  value: RouteLandmark[] | undefined
  onChange: (next: RouteLandmark[]) => void
  /** OpenStreetMap did not answer on the last parse: some names are missing. */
  placesUnavailable?: boolean
  /** How the card labels them (default: names). */
  labels?: LandmarkLabels
  onLabelsChange: (labels: LandmarkLabels) => void
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
 * The spots found when parsing the GPX (its waypoints plus detected summits
 * and cols), in route order: each one's type and name can be fixed, and any
 * of them hidden from the card or dropped.
 */
export function RouteLandmarksField({
  value = [],
  onChange,
  placesUnavailable,
  labels = 'names',
  onLabelsChange,
}: RouteLandmarksFieldProps) {
  const { t } = useClientTranslation('admin')

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
    onChange(value.map((l, k) => (k === i ? { ...l, ...change } : l)))
  }

  return (
    <FieldGroup>
      <FieldLabel>{t('cards.fields.landmarks')}</FieldLabel>
      {placesUnavailable && (
        <StyledEmpty role="status" data-testid="rt-landmarks-osm-down">
          {t('cards.fields.landmarksOsmDown')}
        </StyledEmpty>
      )}
      {value.length > 0 && (
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
                onClick={() => onLabelsChange(mode)}
                data-testid={`rt-labels-${mode}`}
              >
                {t(`cards.fields.landmarkModes.${mode}`)}
              </Button>
            ))}
          </StyledModes>
          <StyledEmpty>
            {t(`cards.fields.landmarkModeHints.${labels}`)}
          </StyledEmpty>
          <Checkbox
            id="rt-landmark-altitude"
            label={t('cards.fields.landmarkAltitude')}
            checked={value.every((l) => !l.hideAltitude)}
            onChange={(show) =>
              onChange(
                value.map((l) => ({
                  ...l,
                  hideAltitude: show ? undefined : true,
                })),
              )
            }
          />
        </>
      )}
      {value.length === 0 ? (
        <StyledEmpty>{t('cards.fields.landmarksEmpty')}</StyledEmpty>
      ) : (
        <StyledList data-testid="rt-landmarks">
          {value.map((l, i) => (
            <StyledRow key={`${l.kind}-${l.index}`} $hidden={Boolean(l.hidden)}>
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
                data-testid={`rt-landmark-toggle-${i}`}
              >
                {l.hidden ? '◌' : '●'}
              </Button>
              <Select
                id={`rt-landmark-type-${i}`}
                value={typeValue(l)}
                onChange={(value) => patch(i, typePatch(value))}
                options={typeOptions}
                formatOptionLabel={typeOption}
                data-testid={`rt-landmark-type-${i}`}
              />
              <StyledAltitude>
                <Checkbox
                  id={`rt-landmark-alt-${i}`}
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
                data-testid={`rt-landmark-name-${i}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                aria-label={t('cards.fields.landmarkRemove')}
                title={t('cards.fields.landmarkRemove')}
                data-testid={`rt-landmark-remove-${i}`}
              >
                ✕
              </Button>
            </StyledRow>
          ))}
        </StyledList>
      )}
    </FieldGroup>
  )
}
