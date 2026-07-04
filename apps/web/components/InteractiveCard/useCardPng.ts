import { useCallback } from 'react'

import { svgToPng } from '@web/lib/cards'
import type { CardResult } from '@web/lib/cards'

/**
 * Rasterises a summary card to PNG. Returns the export blob (for uploads) and a
 * ready-made browser download, both derived from the same static card SVG so
 * the admin preview and the public post render identical exports.
 */
export function useCardPng(card: CardResult) {
  const exportPng = useCallback(
    () => svgToPng(card.svg, card.width, card.height),
    [card],
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
