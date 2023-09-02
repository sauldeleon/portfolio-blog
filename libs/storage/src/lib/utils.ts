export function parseJSON<T>(value: string | null): T | undefined {
  if (value === 'undefined' || value === null) {
    return undefined
  }
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}
