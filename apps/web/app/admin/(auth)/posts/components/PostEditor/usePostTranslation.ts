import { useCallback, useEffect, useRef, useState } from 'react'

import { type PostFields, parseTranslation } from '@web/lib/ai/parseTranslation'
import {
  type TranslationStatus,
  blocksTranslation,
  unavailable,
} from '@web/lib/ai/translationStatus'

type Locale = 'en' | 'es'

interface ErrorBody {
  reason?: Exclude<TranslationStatus, { available: true }>['reason']
  message?: string
  error?: string
}

async function loadStatus(): Promise<TranslationStatus> {
  try {
    const res = await fetch('/api/translate')
    return (await res.json()) as TranslationStatus
  } catch {
    return unavailable('unavailable')
  }
}

/**
 * Streams a post translation from `/api/translate`, and keeps track of
 * whether Claude can be used at all (`status`, null while checking).
 */
export function usePostTranslation() {
  const [status, setStatus] = useState<TranslationStatus | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let active = true
    void loadStatus().then((next) => {
      if (active) setStatus(next)
    })
    return () => {
      active = false
    }
  }, [])

  const recheck = useCallback(async () => {
    setStatus(null)
    setError(null)
    setStatus(await loadStatus())
  }, [])

  const translate = useCallback(
    async (
      from: Locale,
      to: Locale,
      fields: PostFields,
      onProgress: (fields: Partial<PostFields>) => void,
    ) => {
      const controller = new AbortController()
      abortRef.current = controller
      setIsTranslating(true)
      setError(null)
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, ...fields }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as ErrorBody
          // Out of credit, bad key, Claude down…: off until rechecked.
          if (data.reason && blocksTranslation(data.reason)) {
            setStatus(unavailable(data.reason))
            return
          }
          throw new Error(data.message ?? data.error ?? 'Translation failed')
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let raw = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          raw += decoder.decode(value, { stream: true })
          onProgress(parseTranslation(raw))
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Translation failed')
        }
      } finally {
        abortRef.current = null
        setIsTranslating(false)
      }
    },
    [],
  )

  const cancel = useCallback(() => abortRef.current?.abort(), [])

  return { status, recheck, translate, cancel, isTranslating, error }
}
