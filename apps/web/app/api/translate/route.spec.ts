/**
 * @jest-environment node
 */
import Anthropic from '@anthropic-ai/sdk'

import { GET, POST } from './route'

const mockAuth = jest.fn()
const mockCreate = jest.fn()
const mockRetrieve = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: () => mockAuth() }))
jest.mock('@web/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: (...args: unknown[]) => mockCreate(...args) },
    models: { retrieve: (...args: unknown[]) => mockRetrieve(...args) },
  })),
}))

const BODY = {
  from: 'es',
  to: 'en',
  title: 'Título',
  excerpt: 'Resumen',
  content: 'Hola',
}

function request(body: unknown) {
  return new Request('http://localhost/api/translate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

async function* events(items: unknown[]) {
  for (const item of items) yield item
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { name: 'admin' } })
  process.env.ANTHROPIC_API_KEY = 'test-key'
  delete process.env.ANTHROPIC_MODEL
  delete process.env.ANTHROPIC_WORKSPACE_ID
})

afterAll(() => {
  delete process.env.ANTHROPIC_API_KEY
})

describe('GET /api/translate', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
  })

  it('reports a missing key', async () => {
    delete process.env.ANTHROPIC_API_KEY
    expect(await (await GET()).json()).toMatchObject({
      available: false,
      reason: 'not_configured',
    })
  })

  it('checks the model without spending tokens', async () => {
    mockRetrieve.mockResolvedValue({ id: 'claude-opus-5-5' })
    expect(await (await GET()).json()).toEqual({ available: true })
    expect(mockRetrieve).toHaveBeenCalledWith('claude-opus-5-5')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('explains why Claude is unavailable', async () => {
    mockRetrieve.mockRejectedValue(
      Object.assign(new Error('x'), { status: 401 }),
    )
    expect(await (await GET()).json()).toMatchObject({
      available: false,
      reason: 'invalid_key',
    })
  })
})

describe('POST /api/translate', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    expect((await POST(request(BODY))).status).toBe(401)
  })

  it('rejects same-language or empty requests', async () => {
    expect((await POST(request({ ...BODY, to: 'es' }))).status).toBe(400)
    expect(
      (await POST(request({ ...BODY, title: ' ', excerpt: '', content: '' })))
        .status,
    ).toBe(400)
  })

  it('needs an API key', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const res = await POST(request(BODY))
    expect(res.status).toBe(503)
    expect(await res.json()).toMatchObject({ reason: 'not_configured' })
  })

  it('streams the text of the reply', async () => {
    mockCreate.mockResolvedValue(
      events([
        { type: 'message_start' },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: '<title>Title' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'input_json_delta', partial_json: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: '</title>' },
        },
      ]),
    )
    const res = await POST(request(BODY))
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(await res.text()).toBe('<title>Title</title>')
    const [params, options] = mockCreate.mock.calls[0]
    expect(params).toMatchObject({
      model: 'claude-opus-5-5',
      stream: true,
      system: [
        expect.objectContaining({ cache_control: { type: 'ephemeral' } }),
      ],
    })
    expect(params.messages[0].content).toContain(
      'from Spanish (Spain) to English',
    )
    expect(options.signal).toBeDefined()
  })

  it('names the workspace for keys not scoped to one', async () => {
    mockCreate.mockResolvedValue(events([]))
    await (await POST(request(BODY))).text()
    expect(jest.mocked(Anthropic)).toHaveBeenLastCalledWith({
      apiKey: 'test-key',
      defaultHeaders: undefined,
    })
    process.env.ANTHROPIC_WORKSPACE_ID = 'wrkspc_1'
    await (await POST(request(BODY))).text()
    expect(jest.mocked(Anthropic)).toHaveBeenLastCalledWith({
      apiKey: 'test-key',
      defaultHeaders: { 'anthropic-workspace-id': 'wrkspc_1' },
    })
  })

  it('uses the configured model', async () => {
    process.env.ANTHROPIC_MODEL = 'claude-haiku-5-5'
    mockCreate.mockResolvedValue(events([]))
    await (await POST(request(BODY))).text()
    expect(mockCreate.mock.calls[0][0].model).toBe('claude-haiku-5-5')
  })

  it('reports why a request failed', async () => {
    mockCreate.mockRejectedValue(
      Object.assign(new Error('Your credit balance is too low'), {
        status: 400,
      }),
    )
    const res = await POST(request(BODY))
    expect(res.status).toBe(502)
    expect(await res.json()).toMatchObject({ reason: 'no_credit' })
    expect(mockLoggerError).toHaveBeenCalled()
  })

  it('errors the stream when it breaks midway', async () => {
    mockCreate.mockResolvedValue(
      (async function* () {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'partial' },
        }
        throw new Error('cut')
      })(),
    )
    const res = await POST(request(BODY))
    await expect(res.text()).rejects.toThrow('cut')
    expect(mockLoggerError).toHaveBeenCalled()
  })
})
