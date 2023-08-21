import { AnimatedItem } from './Portals'

export function animationItemSeedGenerator(
  item: Omit<AnimatedItem, 'seeds'>
): AnimatedItem {
  return {
    ...item,
    seeds: {
      verticalStartPoint: Math.random().toString(36).slice(2),
      horizontalDuration: Math.random().toString(36).slice(2),
      horizontalDelay: Math.random().toString(36).slice(2),
      verticalDuration: Math.random().toString(36).slice(2),
      verticalRange: Math.random().toString(36).slice(2),
      color: Math.random().toString(36).slice(2),
      zIndex: Math.random().toString(36).slice(2),
      rotationDuration: Math.random().toString(36).slice(2),
      rotationAmount: Math.random().toString(36).slice(2),
    },
  }
}
