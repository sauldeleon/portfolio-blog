import { useCallback, useMemo } from 'react'

import { croquisCard, svgToPng } from '@web/lib/cards'
import type { CroquisObstacle, Lang } from '@web/lib/cards'

/**
 * Rasterises a croquis to PNG. Returns the export blob (for uploads) and a
 * ready-made browser download, both derived from the same static card SVG so
 * the admin preview and the public post render identical exports.
 */
export function useCroquisPng(
  obstacles: CroquisObstacle[],
  lang: Lang,
  title?: string,
) {
  const staticSvg = useMemo(
    () => croquisCard(obstacles, lang, { title }),
    [obstacles, lang, title],
  )

  const exportPng = useCallback(
    () => svgToPng(staticSvg.svg, staticSvg.width, staticSvg.height),
    [staticSvg],
  )

  const downloadPng = useCallback(
    async (filename: string) => {
      const blob = await exportPng()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.png`
      a.click()
      URL.revokeObjectURL(url)
    },
    [exportPng],
  )

  return { exportPng, downloadPng }
}
