import { ImageProps } from 'next/image'
import { useId } from 'react'

import { useClientTranslation } from '@web/i18n/client'

import { StyledPortrait, StyledPortraitContainer } from './Portrait.styles'

interface PortraitProps extends Omit<ImageProps, 'src' | 'alt'> {
  onClick: () => void
}
export function Portrait({ onClick, width, height }: PortraitProps) {
  const { t } = useClientTranslation('contactPage')
  const id = useId()
  const portraitsSrc = [
    '/assets/portrait-1.png',
    '/assets/portrait-2.png',
    '/assets/portrait-3.png',
    '/assets/portrait-4.png',
    '/assets/portrait-5.png',
    '/assets/portrait-6.png',
  ]
  return (
    <StyledPortraitContainer>
      {portraitsSrc.map((portraitSrc, index) => (
        <StyledPortrait
          $index={index}
          $totalImages={portraitsSrc.length}
          key={`${id}-${index}`}
          src={portraitSrc}
          alt={t('profilePicture')}
          width={140}
          height={140}
          onClick={onClick}
        />
      ))}
    </StyledPortraitContainer>
  )
}
