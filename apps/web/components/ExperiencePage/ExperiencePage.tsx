import { StyledHeading } from './ExperiencePage.styles'
import { useClientTranslation } from '@web/i18n/client'
import { ExperienceItem } from './components/ExperienceItem/ExperienceItem'

export type ExperienceItem = {
  order: number
  company: string
  technologies: string[]
  beginDate: string
  endDate?: string
  link: string
  linkLabel: string
  descriptionParagraphs: string[]
}

export function ExperiencePage() {
  const { t } = useClientTranslation('experiencePage')

  const experienceItems: ExperienceItem[] = [
    {
      order: 0,
      company: 'Bonhams',
      technologies: ['Next.js', 'TypeScript', 'React', 'Styled Components'],
      beginDate: 'January 2022',
      link: 'https://www.bonhams.com/',
      linkLabel: 'Check the website',
      descriptionParagraphs: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
        'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
      ],
    },
    {
      order: 1,
      company: 'Smart Protection',
      technologies: ['TypeScript', 'React', 'ANTd'],
      beginDate: 'February 2021',
      endDate: 'January 2022',
      link: 'https://www.smartprotection.com/',
      linkLabel: 'Check the website',
      descriptionParagraphs: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non quam nec dui luctus faucibus. Nullam quis risus eget urna mollis ornare vel eu leo.',
        'Nulla vitae elit libero, a pharetra augue. Donec ullamcorper nulla non metus auctor fringilla.',
      ],
    },
  ]

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
