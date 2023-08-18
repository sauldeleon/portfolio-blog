import seedrandom from 'seedrandom'

import { AnimatedItem } from './Portals'

export function randomDecimalFromInterval(
  min: number,
  max: number,
  seed?: string
) {
  const randomGenerator = seedrandom(seed)
  return randomGenerator() * (max - min + 1) + min
}

export function randomIntFromInterval(min: number, max: number, seed?: string) {
  return Math.floor(randomDecimalFromInterval(min, max, seed))
}

export function randomColor(seed?: string) {
  const randomGenerator = seedrandom(seed)
  return '#' + (((1 << 24) * randomGenerator()) | 0).toString(16)
}

export function animationItemSeedGenerator(
  item: Omit<AnimatedItem, 'seeds'>
): AnimatedItem {
  return {
    ...item,
    seeds: {
      keyframe: Math.random().toString(36).slice(2),
      verticalStartPoint: Math.random().toString(36).slice(2),
      horizontalDuration: Math.random().toString(36).slice(2),
      horizontalDelay: Math.random().toString(36).slice(2),
      verticalZIndex: Math.random().toString(36).slice(2),
      verticalDuration: Math.random().toString(36).slice(2),
      verticalRange: Math.random().toString(36).slice(2),
      verticalColor: Math.random().toString(36).slice(2),
      rotationZIndex: Math.random().toString(36).slice(2),
      rotationColor: Math.random().toString(36).slice(2),
      rotationDuration: Math.random().toString(36).slice(2),
      rotationAmount: Math.random().toString(36).slice(2),
    },
  }
}
