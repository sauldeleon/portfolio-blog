import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Makes an element fill the viewport from its top edge down, and stops the
 * page itself from scrolling while it is mounted, so only the element's own
 * panes scroll. Below `minWidth` the page keeps its normal flow.
 */
export function useFillViewport<T extends HTMLElement>(minWidth: number) {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    /* istanbul ignore next -- the ref is always attached when mounted */
    if (!el) return
    const root = document.documentElement
    const originalOverflow = root.style.overflow

    function update() {
      if (window.innerWidth < minWidth) {
        root.style.overflow = originalOverflow
        setHeight(null)
        return
      }
      window.scrollTo(0, 0)
      root.style.overflow = 'hidden'
      setHeight(window.innerHeight - (el as T).getBoundingClientRect().top)
    }

    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      root.style.overflow = originalOverflow
    }
  }, [minWidth])

  return { ref, height }
}
