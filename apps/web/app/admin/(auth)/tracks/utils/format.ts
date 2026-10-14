export function formatDistance(metres: number): string {
  return metres >= 1000
    ? `${(metres / 1000).toFixed(2)} km`
    : `${Math.round(metres)} m`
}

export function formatElevation(metres: number | null): string {
  return metres === null ? '—' : `${Math.round(metres)} m`
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}
