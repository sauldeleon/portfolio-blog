/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server'

import { GET } from './route'

const mockParams = (lng: string) => ({
  params: Promise.resolve({ lng }),
})

describe('GET /api/markdown/[lng]', () => {
  it('returns English markdown content', async () => {
    const response = await GET({} as NextRequest, mockParams('en'))
    const text = await response.text()

    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    )
    expect(response.headers.get('x-markdown-tokens')).toBeTruthy()
    expect(text).toContain('# Saúl de León Guerrero')
    expect(text).toContain('Front-End Software Engineer')
    expect(text).toContain('https://github.com/sauldeleon')
  })

  it('returns Spanish markdown content', async () => {
    const response = await GET({} as NextRequest, mockParams('es'))
    const text = await response.text()

    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    )
    expect(text).toContain('# Saúl de León Guerrero')
    expect(text).toContain('Ingeniero de Software Front-End')
  })

  it('falls back to English for unknown language', async () => {
    const response = await GET({} as NextRequest, mockParams('fr'))
    const text = await response.text()

    expect(text).toContain('Front-End Software Engineer')
  })
})
