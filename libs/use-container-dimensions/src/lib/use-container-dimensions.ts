import { RefObject, useEffect, useState } from 'react'

import { useDebounce } from '@sdlgr/use-debounce'

const getDimensions = (ref: RefObject<HTMLElement>) => ({
  width: ref.current?.offsetWidth || 0,
  height: ref.current?.offsetHeight || 300,
})

export const useContainerDimensions = (myRef: RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const handleResize = () => {
    setDimensions(getDimensions(myRef))
  }

  const debouncedHandleResize = useDebounce(handleResize, 200)

  useEffect(() => {
    if (myRef.current) {
      setDimensions(getDimensions(myRef))
    }

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [myRef, debouncedHandleResize])

  return dimensions
}
