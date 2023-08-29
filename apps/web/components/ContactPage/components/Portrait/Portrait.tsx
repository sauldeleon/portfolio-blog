import { ImageProps } from 'next/image'

import { useClientTranslation } from '@web/i18n/client'

import { StyledPortrait } from './Portrait.styles'

interface PortraitProps
  extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  onClick: () => void
}
export function Portrait({ onClick }: PortraitProps) {
  const { t } = useClientTranslation('contactPage')
  return (
    <StyledPortrait
      src="/assets/portrait-1.png"
      alt={t('profilePicture')}
      width={140}
      height={140}
      onClick={onClick}
    />
  )
}
