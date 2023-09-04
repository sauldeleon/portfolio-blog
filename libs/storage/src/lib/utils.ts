export function parseJSON<T>(value: string): T | null {
  if (value === 'undefined' || value === 'null') {
    return null
  }
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}
