import { parseWaypointNotes } from './waypointNotes'

describe('parseWaypointNotes', () => {
  it('splits lines, strips bullets, and indents by leading whitespace', () => {
    expect(parseWaypointNotes('- Top\n  - Nested\nPlain')).toEqual([
      { level: 0, text: 'Top' },
      { level: 2, text: 'Nested' },
      { level: 0, text: 'Plain' },
    ])
  })

  it('caps the level and drops blank lines', () => {
    expect(parseWaypointNotes('        • deep\n\n')).toEqual([
      { level: 4, text: 'deep' },
    ])
    expect(parseWaypointNotes('')).toEqual([])
  })
})
