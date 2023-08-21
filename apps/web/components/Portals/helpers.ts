import { AnimatedItem } from './Portals'

export function animationItemSeedGenerator(
  item: Omit<AnimatedItem, 'seed'>
): AnimatedItem {
  return {
    ...item,
    seed: Math.random().toString(36).slice(2),
  }
}
