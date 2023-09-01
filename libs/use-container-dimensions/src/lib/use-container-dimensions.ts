import { RefObject, useEffect, useState } from 'react'

import { useDebounce } from '@sdlgr/use-debounce'

export const getDimensions = (ref: RefObject<HTMLElement>) => ({
  width: ref.current?.offsetWidth || 600,
  height: ref.current?.offsetHeight || 305,
})

interface UseContainerDimensionsProps {
  myRef: RefObject<HTMLElement>
  enableResizeListener?: boolean
}

export const useContainerDimensions = ({
  myRef,
  enableResizeListener = false,
}: UseContainerDimensionsProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const handleResize = () => {
    setDimensions(getDimensions(myRef))
  }

  const debouncedHandleResize = useDebounce(handleResize, 200)

  useEffect(() => {
    if (myRef.current) {
      setDimensions(getDimensions(myRef))
    }

    if (enableResizeListener) {
      window.addEventListener('resize', debouncedHandleResize)
    }

    return () => {
      if (enableResizeListener) {
        window.removeEventListener('resize', debouncedHandleResize)
      }
    }
  }, [myRef, enableResizeListener, debouncedHandleResize])

  return dimensions
}
