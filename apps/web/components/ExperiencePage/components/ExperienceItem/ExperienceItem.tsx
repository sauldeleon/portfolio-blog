'use client'

import { useId } from 'react'

import { ArrowRightIcon } from '@sdlgr/assets'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import {
  AnimatedItemKey,
  animatedItemMap,
} from '@web/utils/animatedItem/animatedItemMap'
import { parseRichText } from '@web/utils/parseRichText/parseRichText'
import { getTechColor } from '@web/utils/techColors'

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
  sectionId: string
}

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0')

function parseParagraph(text: string, paragraphIndex: number) {
  return (
    <StyledDescriptionParagraph key={paragraphIndex}>
      {parseRichText(text, {
        bold: (k, t) => (
          <StyledTechnology key={k} $color={getTechColor(t)}>
            {t}
          </StyledTechnology>
        ),
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
  sectionId,
}: Readonly<ExperienceItemProps>) {
  const id = useId()

  return (
    <StyledSection id={sectionId}>
      <StyledExperienceHeader>
        <StyledCompany>
          <StyledOrder>{zeroPad(order + 1, 2)}</StyledOrder>
          <StyledCompanyName as="h2">{company}</StyledCompanyName>
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
