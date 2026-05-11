import { format } from 'date-fns'

import { getServerTranslation } from '@web/i18n/server'

import { ExperiencePageTitle } from './ExperiencePageTitle'
import { ExperienceItem as ExperienceItemCard } from './components/ExperienceItem/ExperienceItem'
import { getExperienceItems } from './experienceItems'

export type { ExperienceItem } from './experienceItems'

interface ExperiencePageProps {
  lng: string
}

export async function ExperiencePage({ lng }: ExperiencePageProps) {
  const { t } = await getServerTranslation({
    ns: 'experiencePage',
    language: lng,
  })
  const checkWebsiteLabel = t('checkWebsiteLink')
  const experienceItems = getExperienceItems().sort((a, b) => a.order - b.order)

  return (
    <>
      <ExperiencePageTitle>{t('title')}</ExperiencePageTitle>
      {experienceItems.map(
        ({ descriptionParagraphKeys, beginDate, endDate, ...item }) => (
          <ExperienceItemCard
            key={item.order}
            {...item}
            period={`${format(beginDate, 'MMM yyyy')}${endDate ? format(endDate, ' - MMM yyyy') : ''}`}
            ariaLabel={t('usedTechnologies', { company: item.company })}
            checkWebsiteLabel={checkWebsiteLabel}
            paragraphs={descriptionParagraphKeys.map((k) => t(k))}
          />
        ),
      )}
    </>
  )
}
