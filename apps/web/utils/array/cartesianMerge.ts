export const cartesianMerge = (arr1: string[] = [], arr2: string[] = []) => {
  return arr1.flatMap((d) => arr2.map((v) => d + v))
}
