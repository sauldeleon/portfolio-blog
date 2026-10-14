import { groupTrackFiles } from './groupTrackFiles'

const file = (path: string) => ({ path, size: 1, rawUrl: `raw/${path}` })

describe('groupTrackFiles', () => {
  it('pairs originals with their clean siblings, newest first', () => {
    expect(
      groupTrackFiles([
        file('b.gpx'),
        file('a-clean.gpx'),
        file('a.gpx'),
        file('c-clean.GPX'),
      ]),
    ).toEqual([
      { name: 'c', clean: file('c-clean.GPX') },
      { name: 'b', original: file('b.gpx') },
      { name: 'a', original: file('a.gpx'), clean: file('a-clean.gpx') },
    ])
  })
})
