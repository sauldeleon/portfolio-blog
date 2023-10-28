import { useClientTranslation } from '@sdlgr/i18n-client'

import { ExperienceItem } from './ExperiencePage'

export function useExperienceItems(): ExperienceItem[] {
  const { t } = useClientTranslation('experiencePage')
  return [
    {
      order: 0,
      company: 'Bonhams',
      technologies: [
        'nodeJS',
        'cypress',
        'jest',
        'reactQuery',
        'nextJS',
        'styledComponents',
      ],
      beginDate: new Date('2022-02-01T00:00:00.000Z'),
      link: 'https://www.bonhams.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.bonhams.p1'),
        t('experienceItems.bonhams.p2'),
        t('experienceItems.bonhams.p3'),
      ],
    },
    {
      order: 1,
      company: 'Smart Protection',
      technologies: ['nodeJS'],
      beginDate: new Date('2021-02-01T00:00:00.000Z'),
      endDate: new Date('2022-02-01T00:00:00.000Z'),
      link: 'https://www.smartprotection.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.smartProtection.p1'),
        t('experienceItems.smartProtection.p2'),
        t('experienceItems.smartProtection.p3'),
      ],
    },
  ]
}
