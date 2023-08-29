import { useId } from 'react'

import { Tooth } from '@sdlgr/assets'

import { useClientTranslation } from '@web/i18n/client'

import {
  RotateTooth,
  StyledPortraitContainer,
  StyledTooth,
  StyledToothLessPortrait,
  ToothHoleImage,
} from './ToothLessPortrait.styles'

interface ToothLessPortraitProps {
  onClick: () => void
}

export function ToothLessPortrait({ onClick }: ToothLessPortraitProps) {
  const { t } = useClientTranslation('contactPage')

  const id = useId()
  const toothImages = [
    '/assets/toothPlace-1.png',
    '/assets/toothPlace-2.png',
    '/assets/toothPlace-3.png',
    '/assets/toothPlace-4.png',
    '/assets/toothPlace-5.png',
    '/assets/toothPlace-6.png',
    '/assets/toothPlace-7.png',
    '/assets/toothPlace-8.png',
  ]

  return (
    <div onClick={onClick}>
      {toothImages.map((_, index) => (
        <StyledTooth key={`${id}-${index}`} $index={index}>
          <RotateTooth>
            <Tooth width={10} height={10} />
          </RotateTooth>
        </StyledTooth>
      ))}

      <StyledPortraitContainer>
        <StyledToothLessPortrait
          src="/assets/portrait.jpg"
          alt={t('toothlessProfilePicture')}
          width={140}
          height={140}
        />
        <ToothHoleImage $images={toothImages} />
      </StyledPortraitContainer>
    </div>
  )
}
