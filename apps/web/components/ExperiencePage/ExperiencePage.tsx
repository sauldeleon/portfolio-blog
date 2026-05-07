'use client'

import { ParseKeys } from 'i18next'
import { useId } from 'react'

import { useClientTranslation } from '@web/i18n/client'
import { AnimatedItemKey } from '@web/utils/animatedItem/animatedItemMap'

import { StyledHeading } from './ExperiencePage.styles'
import { ExperienceItem as ExperienceItemCard } from './components/ExperienceItem/ExperienceItem'
import { useExperienceItems } from './useExperienceItems'

export type ExperienceItem = {
  order: number
  company: string
  technologies: AnimatedItemKey[]
  beginDate: Date
  endDate?: Date
  descriptionParagraphKeys: ParseKeys<'experiencePage'>[]
  link?: string
}

export function ExperiencePage() {
  const { t } = useClientTranslation('experiencePage')
  const id = useId()

  const experienceItems = useExperienceItems().sort((a, b) => a.order - b.order)

  return (
    <>
      <StyledHeading $level={2}>{t('title')}</StyledHeading>
      {experienceItems.map((props, index) => (
        <ExperienceItemCard key={`${id}-${index}`} {...props} />
      ))}
    </>
  )
}
