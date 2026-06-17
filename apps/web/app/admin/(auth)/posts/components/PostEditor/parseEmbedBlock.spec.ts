import { detectEmbedAtCursor, parseGpxBody } from './parseEmbedBlock'

describe('parseGpxBody', () => {
  it('parses a single track with url only', () => {
    const { tracks } = parseGpxBody('track:https://cdn.com/route.gpx')
    expect(tracks).toHaveLength(1)
    expect(tracks[0]).toEqual({
      url: 'https://cdn.com/route.gpx',
      name: '',
      color: '',
      allowDownload: false,
      showWaypoints: false,
      showElevation: false,
    })
  })

  it('parses track with name', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx | My Trail',
    )
    expect(tracks[0].name).toBe('My Trail')
    expect(tracks[0].color).toBe('')
  })

  it('parses track with color only (double pipe)', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx || #3a86ff',
    )
    expect(tracks[0].name).toBe('')
    expect(tracks[0].color).toBe('#3a86ff')
  })

  it('parses track with name and color', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx | My Trail | #3a86ff',
    )
    expect(tracks[0].name).toBe('My Trail')
    expect(tracks[0].color).toBe('#3a86ff')
  })

  it('parses track with flags only (triple pipe)', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx ||| download showWaypoints',
    )
    expect(tracks[0].name).toBe('')
    expect(tracks[0].color).toBe('')
    expect(tracks[0].allowDownload).toBe(true)
    expect(tracks[0].showWaypoints).toBe(true)
  })

  it('parses track with name and flags (no color)', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx | My Trail || download',
    )
    expect(tracks[0].name).toBe('My Trail')
    expect(tracks[0].color).toBe('')
    expect(tracks[0].allowDownload).toBe(true)
  })

  it('parses track with color and flags (no name)', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx || #3a86ff | showWaypoints',
    )
    expect(tracks[0].name).toBe('')
    expect(tracks[0].color).toBe('#3a86ff')
    expect(tracks[0].showWaypoints).toBe(true)
  })

  it('parses track with all fields', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx | My Trail | #3a86ff | download showWaypoints',
    )
    expect(tracks[0]).toEqual({
      url: 'https://cdn.com/route.gpx',
      name: 'My Trail',
      color: '#3a86ff',
      allowDownload: true,
      showWaypoints: true,
      showElevation: false,
    })
  })

  it('parses multiple tracks', () => {
    const body = [
      'track:https://cdn.com/a.gpx | Track A | #e63946',
      'track:https://cdn.com/b.gpx | Track B | #3a86ff',
    ].join('\n')
    const { tracks } = parseGpxBody(body)
    expect(tracks).toHaveLength(2)
    expect(tracks[0].url).toBe('https://cdn.com/a.gpx')
    expect(tracks[1].url).toBe('https://cdn.com/b.gpx')
  })

  it('parses waypoint mappings', () => {
    const body = [
      'track:https://cdn.com/route.gpx',
      '0:Summit=https://img.com/wp1.jpg',
      '0:Basecamp=https://img.com/wp2.jpg',
    ].join('\n')
    const { mappingsByTrack } = parseGpxBody(body)
    expect(mappingsByTrack[0]).toHaveLength(2)
    expect(mappingsByTrack[0][0]).toEqual({
      name: 'Summit',
      imageUrl: 'https://img.com/wp1.jpg',
    })
    expect(mappingsByTrack[0][1]).toEqual({
      name: 'Basecamp',
      imageUrl: 'https://img.com/wp2.jpg',
    })
  })

  it('parses mappings for multiple tracks', () => {
    const body = [
      'track:https://cdn.com/a.gpx',
      'track:https://cdn.com/b.gpx',
      '0:WpA=https://img.com/a.jpg',
      '1:WpB=https://img.com/b.jpg',
    ].join('\n')
    const { mappingsByTrack } = parseGpxBody(body)
    expect(mappingsByTrack[0][0].name).toBe('WpA')
    expect(mappingsByTrack[1][0].name).toBe('WpB')
  })

  it('returns empty mappingsByTrack when no mappings', () => {
    const { mappingsByTrack } = parseGpxBody('track:https://cdn.com/route.gpx')
    expect(Object.keys(mappingsByTrack)).toHaveLength(0)
  })

  it('returns empty tracks array when body is empty', () => {
    const { tracks } = parseGpxBody('')
    expect(tracks).toHaveLength(0)
  })

  it('parses track with empty url (track: with no url)', () => {
    const { tracks } = parseGpxBody('track:')
    expect(tracks).toHaveLength(1)
    expect(tracks[0].url).toBe('')
  })

  it('ignores lines that are not track or mapping', () => {
    const { tracks, mappingsByTrack } = parseGpxBody(
      'track:https://cdn.com/route.gpx\nsome random line',
    )
    expect(tracks).toHaveLength(1)
    expect(Object.keys(mappingsByTrack)).toHaveLength(0)
  })

  it('parses track with elevation flag as showElevation: true', () => {
    const { tracks } = parseGpxBody(
      'track:https://cdn.com/route.gpx ||| elevation',
    )
    expect(tracks[0].showElevation).toBe(true)
  })

  it('parses track without elevation flag as showElevation: false', () => {
    const { tracks } = parseGpxBody('track:https://cdn.com/route.gpx')
    expect(tracks[0].showElevation).toBe(false)
  })
})

describe('detectEmbedAtCursor', () => {
  describe('image blocks', () => {
    const imageContent =
      'Hello\n\n![size=small&alt=A photo](https://cdn.com/img.jpg)\n\nWorld'

    it('detects image block when cursor inside', () => {
      const imgStart = imageContent.indexOf('![')
      const result = detectEmbedAtCursor(imageContent, imgStart + 5)
      expect(result).not.toBeNull()
      expect(result?.type).toBe('image')
    })

    it('returns null when cursor outside any block', () => {
      const result = detectEmbedAtCursor(imageContent, 1)
      expect(result).toBeNull()
    })

    it('parses image url correctly', () => {
      const imgStart = imageContent.indexOf('![')
      const result = detectEmbedAtCursor(imageContent, imgStart + 5)
      expect(result?.parsed).toMatchObject({ url: 'https://cdn.com/img.jpg' })
    })

    it('parses image params correctly', () => {
      const imgStart = imageContent.indexOf('![')
      const result = detectEmbedAtCursor(imageContent, imgStart + 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.size).toBe('small')
      expect(result.parsed.altText).toBe('A photo')
    })

    it('includes surrounding newlines in blockStart/blockEnd', () => {
      const imgStart = imageContent.indexOf('![')
      const result = detectEmbedAtCursor(imageContent, imgStart + 5)
      expect(result?.blockStart).toBe(imgStart - 2)
      const imgEnd = imageContent.indexOf(')') + 1
      expect(result?.blockEnd).toBe(imgEnd + 2)
    })

    it('detects image at cursor on opening bracket', () => {
      const imgStart = imageContent.indexOf('![')
      const result = detectEmbedAtCursor(imageContent, imgStart)
      expect(result?.type).toBe('image')
    })

    it('detects image at cursor on closing paren', () => {
      const imgEnd = imageContent.indexOf(')') + 1
      const result = detectEmbedAtCursor(imageContent, imgEnd - 1)
      expect(result?.type).toBe('image')
    })

    it('parses all image params', () => {
      const content =
        '\n\n![size=medium&align=right&caption=My cap&caption-pos=top&alt=Alt&expand=true&photo-iso=400&photo-aperture=f/2.8&photo-exposure=1/250](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 10)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.size).toBe('medium')
      expect(result.parsed.align).toBe('right')
      expect(result.parsed.caption).toBe('My cap')
      expect(result.parsed.captionPos).toBe('top')
      expect(result.parsed.altText).toBe('Alt')
      expect(result.parsed.expand).toBe(true)
      expect(result.parsed.photoMeta?.iso).toBe('400')
      expect(result.parsed.photoMeta?.aperture).toBe('f/2.8')
      expect(result.parsed.photoMeta?.exposure).toBe('1/250')
    })

    it('parses photo-focal-length param', () => {
      const content =
        '\n\n![photo-focal-length=50mm](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.photoMeta?.focalLength).toBe('50mm')
    })

    it('parses photo-panoramic-count param', () => {
      const content =
        '\n\n![photo-panoramic-count=12](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.photoMeta?.panoramicCount).toBe('12')
    })

    it('parses all photo meta params including new fields', () => {
      const content =
        '\n\n![photo-iso=400&photo-aperture=f/2.8&photo-exposure=1/250&photo-focal-length=50mm&photo-panoramic-count=12](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.photoMeta?.iso).toBe('400')
      expect(result.parsed.photoMeta?.aperture).toBe('f/2.8')
      expect(result.parsed.photoMeta?.exposure).toBe('1/250')
      expect(result.parsed.photoMeta?.focalLength).toBe('50mm')
      expect(result.parsed.photoMeta?.panoramicCount).toBe('12')
    })

    it('defaults to full/none/bottom/false when no params', () => {
      const content = '\n\n![](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.size).toBe('full')
      expect(result.parsed.align).toBe('none')
      expect(result.parsed.captionPos).toBe('bottom')
      expect(result.parsed.expand).toBe(false)
      expect(result.parsed.photoMeta).toBeUndefined()
    })

    it('does not set photoMeta when no photo params', () => {
      const content = '\n\n![alt=test](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.photoMeta).toBeUndefined()
    })

    it('handles param without = sign (flag-style param)', () => {
      const content = '\n\n![expand](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      // expand without =true should not set expand
      expect(result.parsed.expand).toBe(false)
    })

    it('ignores size param with unsupported value', () => {
      const content = '\n\n![size=large](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.size).toBe('full')
    })

    it('ignores align param with unsupported value', () => {
      const content = '\n\n![align=center](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.align).toBe('none')
    })

    it('ignores caption-pos param with non-top value', () => {
      const content = '\n\n![caption-pos=bottom](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.captionPos).toBe('bottom')
    })

    it('ignores expand param with non-true value', () => {
      const content = '\n\n![expand=false](https://cdn.com/img.jpg)\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'image') throw new Error('expected image')
      expect(result.parsed.expand).toBe(false)
    })

    it('does not include blockStart newlines when at start of content', () => {
      const content = '![](https://cdn.com/img.jpg)\n\nSome text'
      const result = detectEmbedAtCursor(content, 2)
      expect(result?.blockStart).toBe(0)
    })

    it('does not include blockEnd newlines when at end of content', () => {
      const content = 'Some text\n\n![](https://cdn.com/img.jpg)'
      const imgEnd = content.indexOf(')') + 1
      const result = detectEmbedAtCursor(content, imgEnd - 1)
      expect(result?.blockEnd).toBe(imgEnd)
    })
  })

  describe('embed blocks', () => {
    const youtubeContent =
      'Intro\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\nOutro'

    it('detects youtube embed when cursor inside', () => {
      const fenceStart = youtubeContent.indexOf('```youtube')
      const result = detectEmbedAtCursor(youtubeContent, fenceStart + 5)
      expect(result?.type).toBe('embed')
    })

    it('parses embed type and url', () => {
      const fenceStart = youtubeContent.indexOf('```youtube')
      const result = detectEmbedAtCursor(youtubeContent, fenceStart + 5)
      if (result?.type !== 'embed') throw new Error('expected embed')
      expect(result.parsed.type).toBe('youtube')
      expect(result.parsed.url).toBe('https://www.youtube.com/embed/abc')
    })

    it('detects maps embed', () => {
      const content =
        '\n\n```maps\nhttps://www.google.com/maps/embed?pb=123\n```\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'embed') throw new Error('expected embed')
      expect(result.parsed.type).toBe('maps')
    })

    it('detects openstreetmap embed', () => {
      const content =
        '\n\n```openstreetmap\nhttps://www.openstreetmap.org/export/embed.html\n```\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'embed') throw new Error('expected embed')
      expect(result.parsed.type).toBe('openstreetmap')
    })

    it('detects wikiloc embed', () => {
      const content =
        '\n\n```wikiloc\nhttps://www.wikiloc.com/wikiloc/embedv2.do?id=123\n```\n\n'
      const result = detectEmbedAtCursor(content, 5)
      if (result?.type !== 'embed') throw new Error('expected embed')
      expect(result.parsed.type).toBe('wikiloc')
    })

    it('returns null for unknown code fence type', () => {
      const content = '\n\n```javascript\nconsole.log("hi")\n```\n\n'
      const result = detectEmbedAtCursor(content, 5)
      expect(result).toBeNull()
    })

    it('includes surrounding newlines in bounds', () => {
      const fenceStart = youtubeContent.indexOf('```youtube')
      const fenceEnd = youtubeContent.indexOf('```', fenceStart + 3) + 3
      const result = detectEmbedAtCursor(youtubeContent, fenceStart + 5)
      expect(result?.blockStart).toBe(fenceStart - 2)
      expect(result?.blockEnd).toBe(fenceEnd + 2)
    })
  })

  describe('gpx blocks', () => {
    const gpxContent = [
      'Intro',
      '',
      '```gpx',
      'track:https://cdn.com/route.gpx | My Trail | #3a86ff | download',
      '0:Summit=https://img.com/wp1.jpg',
      '```',
      '',
      'Outro',
    ].join('\n')

    it('detects gpx block when cursor inside', () => {
      const fenceStart = gpxContent.indexOf('```gpx')
      const result = detectEmbedAtCursor(gpxContent, fenceStart + 5)
      expect(result?.type).toBe('gpx')
    })

    it('parses tracks from gpx block', () => {
      const fenceStart = gpxContent.indexOf('```gpx')
      const result = detectEmbedAtCursor(gpxContent, fenceStart + 5)
      if (result?.type !== 'gpx') throw new Error('expected gpx')
      expect(result.parsed.tracks).toHaveLength(1)
      expect(result.parsed.tracks[0].url).toBe('https://cdn.com/route.gpx')
      expect(result.parsed.tracks[0].name).toBe('My Trail')
      expect(result.parsed.tracks[0].color).toBe('#3a86ff')
      expect(result.parsed.tracks[0].allowDownload).toBe(true)
    })

    it('parses waypoint mappings from gpx block', () => {
      const fenceStart = gpxContent.indexOf('```gpx')
      const result = detectEmbedAtCursor(gpxContent, fenceStart + 5)
      if (result?.type !== 'gpx') throw new Error('expected gpx')
      expect(result.parsed.mappingsByTrack[0]).toHaveLength(1)
      expect(result.parsed.mappingsByTrack[0][0]).toEqual({
        name: 'Summit',
        imageUrl: 'https://img.com/wp1.jpg',
      })
    })

    it('returns null when cursor outside gpx block', () => {
      const result = detectEmbedAtCursor(gpxContent, 2)
      expect(result).toBeNull()
    })
  })

  describe('slideshow blocks', () => {
    const slideshowContent =
      '\n\n```slideshow\n![caption=Sunset&alt=A sunset photo&photo-iso=400&photo-aperture=f/2.8&photo-exposure=1/250&photo-focal-length=50mm&photo-panoramic-count=3](https://example.com/img1.jpg)\n![](https://example.com/img2.jpg)\n```\n\n'

    it('detects a slideshow block when cursor is inside', () => {
      const fenceStart = slideshowContent.indexOf('```slideshow')
      const result = detectEmbedAtCursor(slideshowContent, fenceStart + 5)
      expect(result).not.toBeNull()
      expect(result?.type).toBe('slideshow')
    })

    it('parses slide URL from the block', () => {
      const fenceStart = slideshowContent.indexOf('```slideshow')
      const result = detectEmbedAtCursor(slideshowContent, fenceStart + 5)
      if (result?.type !== 'slideshow') throw new Error('expected slideshow')
      expect(result.parsed.slides).toHaveLength(2)
      expect(result.parsed.slides[0].url).toBe('https://example.com/img1.jpg')
      expect(result.parsed.slides[1].url).toBe('https://example.com/img2.jpg')
    })

    it('parses slide with photo metadata', () => {
      const fenceStart = slideshowContent.indexOf('```slideshow')
      const result = detectEmbedAtCursor(slideshowContent, fenceStart + 5)
      if (result?.type !== 'slideshow') throw new Error('expected slideshow')
      const slide = result.parsed.slides[0]
      expect(slide.photoMeta?.iso).toBe('400')
      expect(slide.photoMeta?.aperture).toBe('f/2.8')
      expect(slide.photoMeta?.exposure).toBe('1/250')
      expect(slide.photoMeta?.focalLength).toBe('50mm')
      expect(slide.photoMeta?.panoramicCount).toBe('3')
    })

    it('parses slide with caption and alt text', () => {
      const fenceStart = slideshowContent.indexOf('```slideshow')
      const result = detectEmbedAtCursor(slideshowContent, fenceStart + 5)
      if (result?.type !== 'slideshow') throw new Error('expected slideshow')
      const slide = result.parsed.slides[0]
      expect(slide.caption).toBe('Sunset')
      expect(slide.altText).toBe('A sunset photo')
    })

    it('detects slideshow (not image) when cursor is on an image line inside the fence', () => {
      const imageLineStart = slideshowContent.indexOf('![caption=')
      const result = detectEmbedAtCursor(slideshowContent, imageLineStart + 5)
      expect(result?.type).toBe('slideshow')
    })

    it('returns null when cursor is outside the slideshow block', () => {
      const result = detectEmbedAtCursor(slideshowContent, 1)
      expect(result).toBeNull()
    })

    it('handles empty slideshow body with no image lines', () => {
      const emptySlideshow = '\n\n```slideshow\n```\n\n'
      const fenceStart = emptySlideshow.indexOf('```slideshow')
      const result = detectEmbedAtCursor(emptySlideshow, fenceStart + 5)
      if (result?.type !== 'slideshow') throw new Error('expected slideshow')
      expect(result.parsed.slides).toEqual([])
    })
  })

  it('returns null for plain text content', () => {
    expect(detectEmbedAtCursor('Just some plain text here.', 5)).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(detectEmbedAtCursor('', 0)).toBeNull()
  })
})
