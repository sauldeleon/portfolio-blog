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
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
        'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
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
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
        'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
      ],
    },
  ]
}
