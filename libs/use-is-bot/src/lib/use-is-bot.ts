import { load } from '@fingerprintjs/botd'
import { useEffect, useState } from 'react'

export interface UseIsBotProps {
  afterDetection?: () => void
}

export function useIsBot(props?: UseIsBotProps) {
  const { afterDetection } = props ?? {}
  const [isBot, setIsBot] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const botdPromise = load()
    botdPromise
      .then((botd) => botd.detect())
      .then((result) => {
        setIsBot(result.bot)
        setIsLoading(false)
        afterDetection?.()
      })
  }, [afterDetection])

  return { isBot, isLoading }
}
