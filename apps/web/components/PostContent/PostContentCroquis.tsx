'use client'

import { CroquisMap } from '@web/components/Croquis'
import { useClientTranslation } from '@web/i18n/client'
import type { CroquisObstacle, Lang } from '@web/lib/cards'

import { StyledCroquisWrapper } from './PostContentCroquis.styles'

/**
 * Renders an interactive canyon croquis embedded in post content. `obstacles`
 * arrives as a JSON string from the remark transform; the map itself is the
 * shared read-only CroquisMap, localised to the current post language.
 */
export function PostContentCroquis({ obstacles }: { obstacles?: string }) {
  const { i18n } = useClientTranslation('common')

  if (!obstacles) return null
  const parsed = JSON.parse(obstacles) as CroquisObstacle[]
  if (parsed.length === 0) return null

  const lang: Lang = i18n.language === 'es' ? 'es' : 'en'

  return (
    <StyledCroquisWrapper data-testid="post-croquis">
      <CroquisMap obstacles={parsed} lang={lang} />
    </StyledCroquisWrapper>
  )
}
