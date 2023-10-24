import { useId } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'

import {
  AnimatedItem,
  AnimatedItemProps,
} from '@web/components/AnimatedItem/AnimatedItem'

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
  StyledPortals,
  StyledSection,
} from './ExperienceItem.styles'

export interface ExperienceItemProps {
  order: number
  company: string
  technologies: AnimatedItemProps[]
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
  const id = useId()
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
          <StyledPortals>
            {technologies
              .filter(({ isHidden }) => !isHidden)
              .map((props, index) => (
                <AnimatedItem key={`${id}-${index}`} {...props} />
              ))}
          </StyledPortals>
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
