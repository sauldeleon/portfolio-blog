/**
 * Name for a newly uploaded track: becomes `<name>.gpx` at the repo root.
 * `-clean` is reserved for the editor's copies.
 */
export function isValidTrackName(name: string): boolean {
  return (
    name === name.trim() &&
    name.length > 0 &&
    name.length <= 120 &&
    !name.startsWith('.') &&
    !/[/\\\p{Cc}]/u.test(name) &&
    !/-clean$/i.test(name)
  )
}

/**
 * Edits never overwrite the original recording: they go to a sibling
 * `<name>-clean.gpx`, which later saves keep reusing.
 */
export function cleanPathFor(path: string): string {
  return /-clean\.gpx$/i.test(path)
    ? path
    : path.replace(/\.gpx$/i, '-clean.gpx')
}

/** File name without its last extension. */
export function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot <= 0 ? filename : filename.slice(0, lastDot)
}
