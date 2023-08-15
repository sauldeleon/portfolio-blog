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
      keyframe: Math.random().toString(36).slice(3),
      verticalStartPoint: Math.random().toString(36).slice(3),
      horizontalDuration: Math.random().toString(36).slice(3),
      horizontalDelay: Math.random().toString(36).slice(3),
      verticalZIndex: Math.random().toString(36).slice(3),
      verticalDuration: Math.random().toString(36).slice(3),
      verticalDelay: Math.random().toString(36).slice(3),
      verticalRange: Math.random().toString(36).slice(3),
      verticalColor: Math.random().toString(36).slice(3),
      rotationZIndex: Math.random().toString(36).slice(3),
      rotationColor: Math.random().toString(36).slice(3),
      rotationDuration: Math.random().toString(36).slice(3),
      rotationDelay: Math.random().toString(36).slice(3),
    },
  }
}
