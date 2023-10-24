import { ArrowRightIcon } from '@sdlgr/assets'
import { Body } from '@sdlgr/typography'

import { Portals } from '@web/components/Portals/Portals'

import {
  StyledCircleLink,
  StyledCompanyInfo,
  StyledCompanyName,
  StyledCompanyPeriod,
  StyledDescriptionParagraph,
  StyledExperienceDescription,
  StyledExperienceHeader,
  StyledExperienceInfo,
  StyledExperiencePortal,
  StyledOrder,
  StyledSection,
} from './ExperienceItem.styles'

export interface ExperienceItemProps {
  order: number
  company: string
  technologies: string[]
  beginDate: string
  endDate?: string
  link: string
  linkLabel: string
  descriptionParagraphs: string[]
}

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

export function ExperienceItem({
  order,
  company,
  technologies,
  beginDate,
  endDate,
  link,
  linkLabel,
  descriptionParagraphs,
}: ExperienceItemProps) {
  return (
    <StyledSection>
      <StyledExperienceHeader>
        <StyledOrder>{zeroPad(order + 1, 2)}</StyledOrder>
        <StyledCompanyInfo>
          <StyledCompanyName>{company}</StyledCompanyName>
          <StyledCompanyPeriod>
            {beginDate} - {endDate ?? 'Present'}
          </StyledCompanyPeriod>
        </StyledCompanyInfo>
      </StyledExperienceHeader>
      <StyledExperienceInfo>
        <StyledExperiencePortal>
          <Portals>
            {technologies.map((tech) => (
              <Body key={tech}>{tech.toUpperCase()}</Body>
            ))}
          </Portals>
        </StyledExperiencePortal>
        <StyledExperienceDescription>
          {descriptionParagraphs.map((paragraph, index) => (
            <StyledDescriptionParagraph key={index}>
              {paragraph}
            </StyledDescriptionParagraph>
          ))}
          <StyledCircleLink
            href={link}
            target="_blank"
            iconContent={<ArrowRightIcon />}
            label={linkLabel}
          />
        </StyledExperienceDescription>
      </StyledExperienceInfo>
    </StyledSection>
  )
}
