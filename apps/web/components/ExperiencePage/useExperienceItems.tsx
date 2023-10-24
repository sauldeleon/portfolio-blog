import { NodeJSIcon } from '@sdlgr/assets'
import { useClientTranslation } from '@sdlgr/i18n-client'

import { ExperienceItem } from './ExperiencePage'

export function useExperienceItems(): ExperienceItem[] {
  const { t } = useClientTranslation('experiencePage')
  return [
    {
      order: 0,
      company: 'Bonhams',
      technologies: [
        {
          svg: <NodeJSIcon />,
          path: 'https://nodejs.org/en/',
          ariaLabel: 'NodeJS',
        },
      ],
      beginDate: 'January 2022',
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
      technologies: [
        {
          svg: <NodeJSIcon />,
          path: 'https://nodejs.org/en/',
          ariaLabel: 'NodeJS',
        },
      ],
      beginDate: 'February 2021',
      endDate: 'January 2022',
      link: 'https://www.smartprotection.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
        'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
      ],
    },
  ]
}
