import { AnimatedItemProps } from '@web/components/AnimatedItem/AnimatedItem'
import { useClientTranslation } from '@web/i18n/client'

import { StyledHeading } from './ExperiencePage.styles'
import { ExperienceItem } from './components/ExperienceItem/ExperienceItem'
import { useExperienceItems } from './useExperienceItems'

export type ExperienceItem = {
  order: number
  company: string
  technologies: AnimatedItemProps[]
  beginDate: string
  endDate?: string
  link: string
  linkLabel: string
  descriptionParagraphs: string[]
}

export function ExperiencePage() {
  const { t } = useClientTranslation('experiencePage')

  const experienceItems = useExperienceItems()

  return (
    <>
      <StyledHeading $level={2}>{t('title')}</StyledHeading>
      {experienceItems
        .sort((a, b) => a.order - b.order)
        .map(
          (
            {
              order,
              company,
              technologies,
              beginDate,
              endDate,
              link,
              linkLabel,
              descriptionParagraphs,
            },
            index,
          ) => (
            <ExperienceItem
              key={index}
              order={order}
              company={company}
              technologies={technologies}
              beginDate={beginDate}
              endDate={endDate}
              link={link}
              linkLabel={linkLabel}
              descriptionParagraphs={descriptionParagraphs}
            />
          ),
        )}
    </>
  )
}
