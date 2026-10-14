import type { TrackFile } from './trackApi'

export interface TrackFileGroup {
  name: string
  original?: TrackFile
  clean?: TrackFile
}

/**
 * Pairs every recording with its `-clean` sibling, if any. Newest first:
 * recordings are named after their date.
 */
export function groupTrackFiles(files: TrackFile[]): TrackFileGroup[] {
  const groups = new Map<string, TrackFileGroup>()
  files.forEach((file) => {
    const isClean = /-clean\.gpx$/i.test(file.path)
    const name = file.path.replace(/(-clean)?\.gpx$/i, '')
    const group = groups.get(name) ?? { name }
    if (isClean) group.clean = file
    else group.original = file
    groups.set(name, group)
  })
  return Array.from(groups.values()).sort((a, b) =>
    b.name.localeCompare(a.name),
  )
}
