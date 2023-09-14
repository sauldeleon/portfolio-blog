import seedrandom from 'seedrandom'

export function randomDecimalFromInterval(
  min: number,
  max: number,
  seed?: string,
) {
  const randomGenerator = seedrandom(seed)
  return randomGenerator() * (max - min + 1) + min
}

export function randomIntFromInterval(min: number, max: number, seed?: string) {
  return Math.floor(randomDecimalFromInterval(min, max, seed))
}

export function randomColor(seed?: string) {
  const randomGenerator = seedrandom(seed)
  return '#' + Math.floor(randomGenerator() * 16777215).toString(16)
}
