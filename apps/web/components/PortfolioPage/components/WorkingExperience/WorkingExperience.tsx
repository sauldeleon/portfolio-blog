'use client'

import { parseRichText } from '@web/utils/parseRichText/parseRichText'
import { getTechColor } from '@web/utils/techColors'

import {
  StyledCompanyName,
  StyledCompanyPeriod,
  StyledList,
  StyledListItem,
  StyledTechnology,
} from './WorkingExperience.styles'

type WorkingExperienceItem = {
  order: number
  company: string
  role: string
  period: string
  bullets: string[]
}

interface WorkingExperienceProps {
  items: WorkingExperienceItem[]
}

export function WorkingExperience({ items }: WorkingExperienceProps) {
  return (
    <>
      {items.map(({ order, company, role, period, bullets }) => (
        <div key={order}>
          <StyledCompanyName $level={2} as="h3">
            {company} - {role}
          </StyledCompanyName>
          <StyledCompanyPeriod>{period}</StyledCompanyPeriod>
          <StyledList>
            {bullets.map((bullet, i) => (
              <StyledListItem key={`${i}-${bullet}`}>
                {parseRichText(bullet, {
                  bold: (k, t) => (
                    <StyledTechnology key={k} $color={getTechColor(t)}>
                      {t}
                    </StyledTechnology>
                  ),
                })}
              </StyledListItem>
            ))}
          </StyledList>
        </div>
      ))}
    </>
  )
}
