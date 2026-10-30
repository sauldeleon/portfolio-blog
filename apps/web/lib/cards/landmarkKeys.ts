import type { RouteLandmark } from './types'

/**
 * Stable React keys for the spots on a profile. Several can sit on the same
 * profile sample (a car park and a hut at the start, short canyons), so the
 * repeats of a kind and sample are numbered.
 */
export function landmarkKeys(
  list: Array<Pick<RouteLandmark, 'kind' | 'index'>>,
): string[] {
  const seen = new Map<string, number>()
  return list.map(({ kind, index }) => {
    const id = `${kind}-${index}`
    const repeat = seen.get(id) ?? 0
    seen.set(id, repeat + 1)
    return `${id}-${repeat}`
  })
}
