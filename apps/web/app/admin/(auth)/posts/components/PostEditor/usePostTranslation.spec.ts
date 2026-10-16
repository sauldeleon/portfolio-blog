import { act, renderHook, waitFor } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'util'

import { usePostTranslation } from './usePostTranslation'

Object.assign(global, { TextDecoder, TextEncoder })

const FIELDS = { title: 'Título', excerpt: 'Resumen', content: 'Hola' }

function streamOf(chunks: string[]) {
  const encoder = new TextEncoder()
  let i = 0
  return {
    getReader: () => ({
      read: async () =>
        i < chunks.length
          ? { done: false, value: encoder.encode(chunks[i++]) }
          : { done: true, value: undefined },
    }),
  }
}

const mockStatus = vi.fn()
const mockPost = vi.fn()

beforeEach(() => {
  mockStatus.mockReset().mockResolvedValue({ available: true })
  mockPost.mockReset()
  global.fetch = vi.fn((_url: string, init?: RequestInit) =>
    init?.method === 'POST'
      ? mockPost(init)
      : mockStatus().then((json: unknown) => ({ json: async () => json })),
  ) as unknown as typeof fetch
})

async function renderReady() {
  const utils = renderHook(() => usePostTranslation())
  await waitFor(() => expect(utils.result.current.status).not.toBeNull())
  return utils
}

describe('usePostTranslation', () => {
  it('checks whether Claude is available', async () => {
    const { result } = await renderReady()
    expect(result.current.status).toEqual({ available: true })
  })

  it('reports Claude as unreachable when the check fails', async () => {
    mockStatus.mockRejectedValue(new Error('offline'))
    const { result } = await renderReady()
    expect(result.current.status).toMatchObject({
      available: false,
      reason: 'unavailable',
    })
  })

  it('ignores a check that ends after unmounting', async () => {
    let resolve: (value: unknown) => void = () => undefined
    mockStatus.mockReturnValue(new Promise((r) => (resolve = r)))
    const { result, unmount } = renderHook(() => usePostTranslation())
    unmount()
    await act(async () => resolve({ available: true }))
    expect(result.current.status).toBeNull()
  })

  it('rechecks on demand', async () => {
    mockStatus.mockResolvedValueOnce({
      available: false,
      reason: 'invalid_key',
      message: 'bad key',
    })
    const { result } = await renderReady()
    expect(result.current.status?.available).toBe(false)
    await act(() => result.current.recheck())
    expect(result.current.status).toEqual({ available: true })
  })

  it('streams the parsed fields', async () => {
    mockPost.mockResolvedValue({
      ok: true,
      body: streamOf(['<title>Title</title><content>\nHel', 'lo\n</content>']),
    })
    const onProgress = vi.fn()
    const { result } = await renderReady()
    await act(() => result.current.translate('es', 'en', FIELDS, onProgress))
    expect(JSON.parse(mockPost.mock.calls[0][0].body)).toEqual({
      from: 'es',
      to: 'en',
      ...FIELDS,
    })
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      title: 'Title',
      content: 'Hel',
    })
    expect(onProgress).toHaveBeenLastCalledWith({
      title: 'Title',
      content: 'Hello',
    })
    expect(result.current.isTranslating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('turns translation off when the account cannot be used', async () => {
    mockPost.mockResolvedValue({
      ok: false,
      json: async () => ({ reason: 'no_credit', message: 'server text' }),
    })
    const { result } = await renderReady()
    await act(() => result.current.translate('es', 'en', FIELDS, vi.fn()))
    expect(result.current.status).toEqual({
      available: false,
      reason: 'no_credit',
      message: 'The Anthropic account has run out of credit.',
    })
    expect(result.current.error).toBeNull()
  })

  it('shows transient errors without turning translation off', async () => {
    mockPost.mockResolvedValue({
      ok: false,
      json: async () => ({ reason: 'rate_limited', message: 'Slow down' }),
    })
    const { result } = await renderReady()
    await act(() => result.current.translate('es', 'en', FIELDS, vi.fn()))
    expect(result.current.error).toBe('Slow down')
    expect(result.current.status).toEqual({ available: true })

    mockPost.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid body' }),
    })
    await act(() => result.current.translate('es', 'en', FIELDS, vi.fn()))
    expect(result.current.error).toBe('Invalid body')
  })

  it('falls back to a generic error', async () => {
    mockPost.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })
    const { result } = await renderReady()
    await act(() => result.current.translate('es', 'en', FIELDS, vi.fn()))
    expect(result.current.error).toBe('Translation failed')

    mockPost.mockRejectedValue('offline')
    await act(() => result.current.translate('es', 'en', FIELDS, vi.fn()))
    expect(result.current.error).toBe('Translation failed')
  })

  it('stays silent when cancelled', async () => {
    mockPost.mockImplementation(
      (init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    const { result } = await renderReady()
    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.translate('es', 'en', FIELDS, vi.fn())
    })
    expect(result.current.isTranslating).toBe(true)
    await act(async () => {
      result.current.cancel()
      await pending
    })
    expect(result.current.isTranslating).toBe(false)
    expect(result.current.error).toBeNull()
    // Cancelling with nothing running is a no-op.
    act(() => result.current.cancel())
  })
})
