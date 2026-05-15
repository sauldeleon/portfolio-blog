import pino from 'pino'

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
