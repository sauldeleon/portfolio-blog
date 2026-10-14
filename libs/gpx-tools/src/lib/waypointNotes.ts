/**
 * Splits a waypoint description into notes: one per line, each stripped of its
 * leading bullet and indented by its leading-whitespace level (max 4).
 */
export function parseWaypointNotes(
  desc: string,
): Array<{ level: number; text: string }> {
  return desc
    .split(/\r?\n/)
    .map((raw) => ({
      level: Math.min(raw.length - raw.trimStart().length, 4),
      text: raw.replace(/^\s*[-•·]\s*/, '').trim(),
    }))
    .filter((n) => n.text)
}
