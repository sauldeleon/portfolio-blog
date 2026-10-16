import pino from 'pino'
import type { MockedFunction } from 'vitest'

import { createLogger, logger } from './logger'

vi.mock('pino', () => ({
  default: vi.fn().mockReturnValue({ level: 'info', info: vi.fn() }),
}))

const mockPino = pino as MockedFunction<typeof pino>

describe('createLogger', () => {
  const originalLogLevel = process.env.LOG_LEVEL

  beforeEach(() => {
    mockPino.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL
    } else {
      process.env.LOG_LEVEL = originalLogLevel
    }
  })

  it('uses silent level in test environment', () => {
    vi.stubEnv('NODE_ENV', 'test')
    delete process.env.LOG_LEVEL
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'silent' }),
    )
  })

  it('uses LOG_LEVEL env var when set', () => {
    vi.stubEnv('NODE_ENV', 'test')
    process.env.LOG_LEVEL = 'debug'
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' }),
    )
  })

  it('uses pino-pretty transport in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    delete process.env.LOG_LEVEL
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({ target: 'pino-pretty' }),
      }),
    )
  })

  it('uses plain pino in production without transport', () => {
    vi.stubEnv('NODE_ENV', 'production')
    delete process.env.LOG_LEVEL
    createLogger()
    const lastCall = mockPino.mock.calls[0][0] as Record<string, unknown>
    expect(lastCall).not.toHaveProperty('transport')
    expect(lastCall).toHaveProperty('level', 'info')
  })
})

describe('logger', () => {
  it('is exported as a singleton', () => {
    expect(logger).toBeDefined()
  })
})
