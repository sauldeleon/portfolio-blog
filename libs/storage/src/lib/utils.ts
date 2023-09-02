export function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : (JSON.parse(value ?? '') as T)
  } catch {
    console.log('parsing error on', { value })
    return undefined
  }
}
