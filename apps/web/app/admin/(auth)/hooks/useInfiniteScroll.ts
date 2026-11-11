'use client'

import { type RefObject, useEffect, useRef } from 'react'

/**
 * Calls `onReachEnd` whenever the sentinel element scrolls into view. Put the
 * sentinel after the last item of an infinitely scrolled list.
 */
export function useInfiniteScroll(
  sentinelRef: RefObject<Element | null>,
  onReachEnd: () => void,
) {
  // Latest callback, so the observer is created once and never goes stale.
  const callbackRef = useRef(onReachEnd)
  useEffect(() => {
    callbackRef.current = onReachEnd
  }, [onReachEnd])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) callbackRef.current()
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelRef])
}
