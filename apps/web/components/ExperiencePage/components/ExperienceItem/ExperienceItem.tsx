'use client'

import { useId } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import {
  AnimatedItemKey,
  animatedItemMap,
} from '@web/utils/animatedItem/animatedItemMap'

import {
  StyledCircleLink,
  StyledCompany,
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
  StyledTechnology,
} from './ExperienceItem.styles'

export interface ExperienceItemProps {
  order: number
  company: string
  technologies: AnimatedItemKey[]
  period: string
  link?: string
  ariaLabel: string
  checkWebsiteLabel: string
  paragraphs: string[]
}

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

function parseParagraph(text: string, paragraphIndex: number) {
  const parts = text.split(/(<bold>[\s\S]*?<\/bold>)/g)
  return (
    <StyledDescriptionParagraph key={paragraphIndex}>
      {parts.map((part, i) => {
        const match = part.match(/^<bold>([\s\S]*?)<\/bold>$/)
        return match ? (
          <StyledTechnology key={i}>{match[1]}</StyledTechnology>
        ) : (
          part
        )
      })}
    </StyledDescriptionParagraph>
  )
}

export function ExperienceItem({
  order,
  company,
  technologies,
  period,
  link,
  ariaLabel,
  checkWebsiteLabel,
  paragraphs,
}: Readonly<ExperienceItemProps>) {
  const id = useId()

  return (
    <StyledSection>
      <StyledExperienceHeader>
        <StyledCompany>
          <StyledOrder>{zeroPad(order + 1, 2)}</StyledOrder>
          <StyledCompanyName>{company}</StyledCompanyName>
        </StyledCompany>
        <StyledCompanyPeriod>{period}</StyledCompanyPeriod>
      </StyledExperienceHeader>
      <StyledExperienceInfo>
        <StyledExperiencePortal>
          <StyledPortals>
            <ul aria-label={ariaLabel}>
              {technologies
                .map((tech) => animatedItemMap[tech])
                .filter(({ isHidden }) => !isHidden)
                .map((props, index) => (
                  <AnimatedItem key={`${id}-${index}`} fastDelay {...props} />
                ))}
            </ul>
          </StyledPortals>
        </StyledExperiencePortal>
        <StyledExperienceDescription>
          {paragraphs.map(parseParagraph)}
          {link && (
            <StyledCircleLink
              href={link}
              target="_blank"
              iconContent={<ArrowRightIcon />}
              label={checkWebsiteLabel}
            />
          )}
        </StyledExperienceDescription>
      </StyledExperienceInfo>
    </StyledSection>
  )
}
