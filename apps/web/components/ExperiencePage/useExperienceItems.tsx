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
        'typescript',
        'styledComponents',
        'vercel',
        'expo',
      ],
      beginDate: new Date('2022-02-01T00:00:00.000Z'),
      link: 'https://www.bonhams.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.bonhams.p1'),
        t('experienceItems.bonhams.p2'),
        t('experienceItems.bonhams.p3'),
        t('experienceItems.bonhams.p4'),
      ],
    },
    {
      order: 1,
      company: 'Smart Protection',
      technologies: [
        'nodeJS',
        'jest',
        'storybook',
        'emotion',
        'reactQuery',
        'yarn',
        'reactJS',
        'typescript',
      ],
      beginDate: new Date('2021-02-01T00:00:00.000Z'),
      endDate: new Date('2022-02-01T00:00:00.000Z'),
      link: 'https://www.smartprotection.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.smartProtection.p1'),
        t('experienceItems.smartProtection.p2'),
        t('experienceItems.smartProtection.p3'),
        t('experienceItems.smartProtection.p4'),
        t('experienceItems.smartProtection.p4'),
        t('experienceItems.smartProtection.p6'),
        t('experienceItems.smartProtection.p7'),
        t('experienceItems.smartProtection.p8'),
      ],
    },
    {
      order: 2,
      company: 'ING',
      technologies: [
        'nodeJS',
        'cypress',
        'npm',
        'cypress',
        'jest',
        'mocha',
        'litElement',
        'redux',
      ],
      beginDate: new Date('2020-08-01T00:00:00.000Z'),
      endDate: new Date('2021-02-01T00:00:00.000Z'),
      link: 'https://www.ing.es/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.ing.p1'),
        t('experienceItems.ing.p2'),
        t('experienceItems.ing.p3'),
        t('experienceItems.ing.p3'),
        t('experienceItems.ing.p4'),
        t('experienceItems.ing.p5'),
      ],
    },
    {
      order: 3,
      company: 'Keytree',
      technologies: [
        'nodeJS',
        'reactJS',
        'yarn',
        'storybook',
        'jest',
        'emotion',
        'redux',
      ],
      beginDate: new Date('2017-10-01T00:00:00.000Z'),
      endDate: new Date('2020-08-01T00:00:00.000Z'),
      descriptionParagraphs: [
        t('experienceItems.keytree.p1'),
        t('experienceItems.keytree.p2'),
        t('experienceItems.keytree.p3'),
      ],
    },
    {
      order: 4,
      company: 'Babel S.I',
      technologies: [
        'nodeJS',
        'expressJS',
        'npm',
        'storybook',
        'jest',
        'mongoDB',
        'angularJS',
        'java',
        'socketIO',
        'ionic',
      ],
      beginDate: new Date('2017-04-01T00:00:00.000Z'),
      endDate: new Date('2017-09-01T00:00:00.000Z'),
      link: 'https://www2.deloitte.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.keytree.p1'),
        t('experienceItems.keytree.p2'),
        t('experienceItems.keytree.p3'),
      ],
    },
    {
      order: 5,
      company: 'Ioon Technologies',
      technologies: [
        'java',
        'spring',
        'ionic',
        'storybook',
        'angularJS',
        'arduino',
      ],
      beginDate: new Date('2016-01-01T00:00:00.000Z'),
      endDate: new Date('2017-04-01T00:00:00.000Z'),
      link: 'https://ioon.es/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.ioon.p1'),
        t('experienceItems.ioon.p2'),
        t('experienceItems.ioon.p3'),
        t('experienceItems.ioon.p4'),
        t('experienceItems.ioon.p5'),
        t('experienceItems.ioon.p6'),
        t('experienceItems.ioon.p7'),
      ],
    },
    {
      order: 6,
      company: 'Clarive',
      technologies: [
        'perl',
        'mongoDB',
        'sencha',
        'javascript',
        'html',
        'css3',
        'oracle',
      ],
      beginDate: new Date('2014-01-01T00:00:00.000Z'),
      endDate: new Date('2016-01-01T00:00:00.000Z'),
      link: 'https://clarive.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.clarive.p1'),
        t('experienceItems.clarive.p2'),
        t('experienceItems.clarive.p3'),
        t('experienceItems.clarive.p4'),
      ],
    },
    {
      order: 7,
      company: 'idealista.com',
      technologies: ['java', 'mongoDB', 'hibernate', 'spring', 'oracle'],
      beginDate: new Date('2013-09-01T00:00:00.000Z'),
      endDate: new Date('2013-12-01T00:00:00.000Z'),
      link: 'https://www.idealista.com/',
      linkLabel: t('checkWebsiteLink'),
      descriptionParagraphs: [
        t('experienceItems.idealista.p1'),
        t('experienceItems.idealista.p2'),
        t('experienceItems.idealista.p3'),
      ],
    },
    {
      order: 8,
      company: 'Incita Security',
      technologies: ['python', 'oracle', 'javascript', 'html', 'css3'],
      beginDate: new Date('2012-11-01T00:00:00.000Z'),
      endDate: new Date('2013-09-01T00:00:00.000Z'),
      descriptionParagraphs: [
        t('experienceItems.incitaSecurity.p1'),
        t('experienceItems.incitaSecurity.p2'),
        t('experienceItems.incitaSecurity.p3'),
        t('experienceItems.incitaSecurity.p4'),
      ],
    },
  ]
}
