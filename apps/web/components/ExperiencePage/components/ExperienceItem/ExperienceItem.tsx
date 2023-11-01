import { format } from 'date-fns'
import { ParseKeys } from 'i18next'
import { useId } from 'react'
import { Trans } from 'react-i18next'

import { ArrowRightIcon } from '@sdlgr/assets'

import { AnimatedItem } from '@web/components/AnimatedItem/AnimatedItem'
import { useClientTranslation } from '@web/i18n/client'
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
  beginDate: Date
  endDate?: Date
  descriptionParagraphKeys: ParseKeys<'experiencePage'>[]
  link?: string
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
  descriptionParagraphKeys,
}: Readonly<ExperienceItemProps>) {
  const id = useId()
  const { t } = useClientTranslation('experiencePage')

  return (
    <StyledSection>
      <StyledExperienceHeader>
        <StyledCompany>
          <StyledOrder>{zeroPad(order + 1, 2)}</StyledOrder>
          <StyledCompanyName>{company}</StyledCompanyName>
        </StyledCompany>
        <StyledCompanyPeriod>
          {`${format(beginDate, 'MMM yyyy')}${
            endDate ? format(endDate, ' - MMM yyyy') : ''
          }`}
        </StyledCompanyPeriod>
      </StyledExperienceHeader>
      <StyledExperienceInfo>
        <StyledExperiencePortal>
          <StyledPortals>
            <ul aria-label={t('usedTechnologies', { company })}>
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
          {descriptionParagraphKeys.map((paragraphKey, index) => (
            <StyledDescriptionParagraph key={`${id}-${index}`}>
              <Trans
                t={t}
                i18nKey={paragraphKey}
                components={{
                  bold: <StyledTechnology />,
                }}
              />
            </StyledDescriptionParagraph>
          ))}
          {link && (
            <StyledCircleLink
              href={link}
              target="_blank"
              iconContent={<ArrowRightIcon />}
              label={t('checkWebsiteLink')}
            />
          )}
        </StyledExperienceDescription>
      </StyledExperienceInfo>
    </StyledSection>
  )
}
