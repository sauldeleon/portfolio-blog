import pino from 'pino'

import { createLogger, logger } from './logger'

jest.mock('pino', () =>
  jest.fn().mockReturnValue({ level: 'info', info: jest.fn() }),
)

const mockPino = pino as jest.MockedFunction<typeof pino>

describe('createLogger', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalLogLevel = process.env.LOG_LEVEL

  beforeEach(() => {
    mockPino.mockClear()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL
    } else {
      process.env.LOG_LEVEL = originalLogLevel
    }
  })

  it('uses silent level in test environment', () => {
    process.env.NODE_ENV = 'test'
    delete process.env.LOG_LEVEL
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'silent' }),
    )
  })

  it('uses LOG_LEVEL env var when set', () => {
    process.env.NODE_ENV = 'test'
    process.env.LOG_LEVEL = 'debug'
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug' }),
    )
  })

  it('uses pino-pretty transport in development', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.LOG_LEVEL
    createLogger()
    expect(mockPino).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({ target: 'pino-pretty' }),
      }),
    )
  })

  it('uses plain pino in production without transport', () => {
    process.env.NODE_ENV = 'production'
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
