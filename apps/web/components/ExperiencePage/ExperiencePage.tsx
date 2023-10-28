import { useId } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import { AnimatedItemKey } from '@web/utils/animatedItem/animatedItemMap'

import { StyledHeading } from './ExperiencePage.styles'
import { ExperienceItem } from './components/ExperienceItem/ExperienceItem'
import { useExperienceItems } from './useExperienceItems'

export type ExperienceItem = {
  order: number
  company: string
  technologies: AnimatedItemKey[]
  beginDate: Date
  endDate?: Date
  link?: string
  linkLabel?: string
  descriptionParagraphs: string[]
}

export function ExperiencePage() {
  const { t } = useClientTranslation('experiencePage')
  const id = useId()

  const experienceItems = useExperienceItems().sort((a, b) => a.order - b.order)

  return (
    <>
      <StyledHeading $level={2}>{t('title')}</StyledHeading>
      {experienceItems.map((props, index) => (
        <ExperienceItem key={`${id}-${index}`} {...props} />
      ))}
    </>
  )
}
