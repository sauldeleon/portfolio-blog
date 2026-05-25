import pino from 'pino'

// Log levels (most → least verbose): trace → debug → info → warn → error → fatal
// Default: info  (info + warn + error)
// Enable debug:  LOG_LEVEL=debug  (adds request-level traces)
// Enable trace:  LOG_LEVEL=trace  (adds db/framework internals)
// Silence:       LOG_LEVEL=silent (used in tests)
//
// Runtime override: set LOG_LEVEL env var before starting the server.
// Example: LOG_LEVEL=debug yarn start:web

export function createLogger() {
  const level =
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === 'test' ? 'silent' : 'info')

  if (process.env.NODE_ENV === 'development') {
    return pino({
      level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    })
  }

  return pino({ level })
}

export const logger = createLogger()
