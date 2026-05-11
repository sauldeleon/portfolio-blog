import { getExperienceItems } from './experienceItems'

export type { ExperienceItem } from './experienceItems'

export function useExperienceItems() {
  return getExperienceItems()
}
