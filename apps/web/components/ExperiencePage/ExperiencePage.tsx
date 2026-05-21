import { format } from 'date-fns'

import { getServerTranslation } from '@web/i18n/server'
import { slugify } from '@web/utils/slugify'

import { ExperienceNav } from './ExperienceNav'
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

  const tocEntries = experienceItems.map(({ company }) => ({
    id: slugify(company),
    text: company,
    depth: 2,
  }))

  return (
    <>
      <ExperiencePageTitle>{t('title')}</ExperiencePageTitle>
      <ExperienceNav entries={tocEntries} label={t('experienceNav')} />
      {experienceItems.map(
        ({ descriptionParagraphKeys, beginDate, endDate, ...item }) => (
          <ExperienceItemCard
            key={item.order}
            {...item}
            sectionId={slugify(item.company)}
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
